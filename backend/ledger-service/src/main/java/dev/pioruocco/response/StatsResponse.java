package dev.pioruocco.response;

import dev.pioruocco.domain.StatsPeriod;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class StatsResponse {

    private String period;
    private StatsPeriod.Granularity bucket;
    private LocalDate from;
    private LocalDate to;

    private BigDecimal balance;

    private int tradeCount;
    private int buyCount;
    private int sellCount;

    private BigDecimal buyVolume;
    private BigDecimal sellVolume;
    private BigDecimal realizedPnl;
    private BigDecimal deposits;
    private BigDecimal withdrawals;
    private BigDecimal transfersOut;

    private List<StatsPoint> series;
}
