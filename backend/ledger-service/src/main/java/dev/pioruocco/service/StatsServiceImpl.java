package dev.pioruocco.service;

import dev.pioruocco.domain.OrderStatus;
import dev.pioruocco.domain.OrderType;
import dev.pioruocco.domain.StatsPeriod;
import dev.pioruocco.domain.WalletTransactionType;
import dev.pioruocco.domain.WithdrawalStatus;
import dev.pioruocco.exception.WalletException;
import dev.pioruocco.model.Order;
import dev.pioruocco.model.OrderItem;
import dev.pioruocco.model.Wallet;
import dev.pioruocco.model.WalletTransaction;
import dev.pioruocco.model.Withdrawal;
import dev.pioruocco.repository.OrderRepository;
import dev.pioruocco.repository.WalletTransactionRepository;
import dev.pioruocco.repository.WithdrawalRepository;
import dev.pioruocco.response.StatsPoint;
import dev.pioruocco.response.StatsResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Stream;

@Service
public class StatsServiceImpl implements StatsService {

    // "all" can span years of history; older activity is folded into the first bucket
    static final int MAX_MONTH_BUCKETS = 24;

    private static final LocalDate EPOCH = LocalDate.of(1970, 1, 1);

    private final OrderRepository orderRepository;
    private final WithdrawalRepository withdrawalRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletService walletService;

    public StatsServiceImpl(OrderRepository orderRepository,
                            WithdrawalRepository withdrawalRepository,
                            WalletTransactionRepository walletTransactionRepository,
                            WalletService walletService) {
        this.orderRepository = orderRepository;
        this.withdrawalRepository = withdrawalRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.walletService = walletService;
    }

    @Override
    @Transactional(readOnly = true)
    public StatsResponse getUserStats(Long userId, StatsPeriod period) throws WalletException {
        LocalDate today = LocalDate.now();
        LocalDate queryFrom = period.getDays() == null ? EPOCH : today.minusDays(period.getDays() - 1L);

        Wallet wallet = walletService.getUserWallet(userId);
        List<Order> orders = orderRepository.findByUserIdAndStatusAndTimestampGreaterThanEqual(
                userId, OrderStatus.SUCCESS, queryFrom.atStartOfDay());
        // Declined withdrawals are refunded without a reversing transaction, so they come
        // from the withdrawal table rather than from WalletTransaction.WITHDRAWAL.
        List<Withdrawal> withdrawals = withdrawalRepository.findByUserIdAndStatusInAndDateGreaterThanEqual(
                userId, List.of(WithdrawalStatus.PENDING, WithdrawalStatus.SUCCESS), queryFrom.atStartOfDay());
        List<WalletTransaction> transactions = walletTransactionRepository.findByWalletAndTypeInAndDateGreaterThanEqual(
                wallet, List.of(WalletTransactionType.ADD_MONEY, WalletTransactionType.WALLET_TRANSFER), queryFrom);

        LocalDate from = period.getDays() != null ? queryFrom : firstActivity(orders, withdrawals, transactions, today);
        StatsPeriod.Granularity granularity = period.getGranularity();

        LocalDate seriesStart = granularity.bucketStart(from);
        if (period == StatsPeriod.ALL) {
            LocalDate oldest = granularity.bucketStart(today).minusMonths(MAX_MONTH_BUCKETS - 1L);
            if (seriesStart.isBefore(oldest)) {
                seriesStart = oldest;
            }
        }

        Map<LocalDate, StatsPoint> buckets = new LinkedHashMap<>();
        for (LocalDate d = seriesStart; !d.isAfter(today); d = granularity.next(d)) {
            buckets.put(d, new StatsPoint(d));
        }
        LocalDate firstBucket = seriesStart;
        BiConsumer<LocalDate, Consumer<StatsPoint>> addTo = (date, op) -> {
            LocalDate key = granularity.bucketStart(date);
            if (key.isBefore(firstBucket)) key = firstBucket;
            StatsPoint point = buckets.get(key);
            if (point != null) op.accept(point);
        };

        int buyCount = 0;
        int sellCount = 0;
        for (Order order : orders) {
            BigDecimal amount = Optional.ofNullable(order.getPrice()).orElse(BigDecimal.ZERO);
            LocalDate date = order.getTimestamp().toLocalDate();
            if (order.getOrderType() == OrderType.BUY) {
                buyCount++;
                addTo.accept(date, p -> p.setBuyVolume(p.getBuyVolume().add(amount)));
            } else {
                sellCount++;
                BigDecimal pnl = realizedPnl(order.getOrderItem());
                addTo.accept(date, p -> {
                    p.setSellVolume(p.getSellVolume().add(amount));
                    p.setRealizedPnl(p.getRealizedPnl().add(pnl));
                });
            }
        }

        for (Withdrawal withdrawal : withdrawals) {
            BigDecimal amount = BigDecimal.valueOf(withdrawal.getAmount());
            addTo.accept(withdrawal.getDate().toLocalDate(), p -> p.setWithdrawals(p.getWithdrawals().add(amount)));
        }

        for (WalletTransaction tx : transactions) {
            BigDecimal amount = Optional.ofNullable(tx.getAmount()).orElse(BigDecimal.ZERO);
            if (tx.getType() == WalletTransactionType.ADD_MONEY) {
                addTo.accept(tx.getDate(), p -> p.setDeposits(p.getDeposits().add(amount)));
            } else if (amount.signum() < 0) {
                // only the sender gets a WALLET_TRANSFER row, stored negative
                addTo.accept(tx.getDate(), p -> p.setTransfersOut(p.getTransfersOut().add(amount.negate())));
            }
        }

        List<StatsPoint> series = new ArrayList<>(buckets.values());

        StatsResponse res = new StatsResponse();
        res.setPeriod(period.getParam());
        res.setBucket(granularity);
        res.setFrom(from);
        res.setTo(today);
        res.setBalance(money(wallet.getBalance()));
        res.setBuyCount(buyCount);
        res.setSellCount(sellCount);
        res.setTradeCount(buyCount + sellCount);
        res.setBuyVolume(money(sum(series, StatsPoint::getBuyVolume)));
        res.setSellVolume(money(sum(series, StatsPoint::getSellVolume)));
        res.setRealizedPnl(money(sum(series, StatsPoint::getRealizedPnl)));
        res.setDeposits(money(sum(series, StatsPoint::getDeposits)));
        res.setWithdrawals(money(sum(series, StatsPoint::getWithdrawals)));
        res.setTransfersOut(money(sum(series, StatsPoint::getTransfersOut)));

        // rounded only after the totals are summed from the unrounded buckets
        for (StatsPoint p : series) {
            p.setBuyVolume(money(p.getBuyVolume()));
            p.setSellVolume(money(p.getSellVolume()));
            p.setRealizedPnl(money(p.getRealizedPnl()));
            p.setDeposits(money(p.getDeposits()));
            p.setWithdrawals(money(p.getWithdrawals()));
            p.setTransfersOut(money(p.getTransfersOut()));
        }
        res.setSeries(series);
        return res;
    }

    // OrderItem prices are doubles; BigDecimal.valueOf keeps their shortest decimal form
    private static BigDecimal realizedPnl(OrderItem item) {
        if (item == null || item.getBuyPrice() <= 0 || item.getSellPrice() <= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(item.getSellPrice())
                .subtract(BigDecimal.valueOf(item.getBuyPrice()))
                .multiply(BigDecimal.valueOf(item.getQuantity()));
    }

    private static LocalDate firstActivity(List<Order> orders, List<Withdrawal> withdrawals,
                                           List<WalletTransaction> transactions, LocalDate today) {
        return Stream.of(
                        orders.stream().map(o -> o.getTimestamp().toLocalDate()),
                        withdrawals.stream().map(w -> w.getDate().toLocalDate()),
                        transactions.stream().map(WalletTransaction::getDate))
                .flatMap(s -> s)
                .min(LocalDate::compareTo)
                .orElse(today);
    }

    private static BigDecimal sum(List<StatsPoint> series, Function<StatsPoint, BigDecimal> field) {
        return series.stream().map(field).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static BigDecimal money(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_EVEN);
    }
}
