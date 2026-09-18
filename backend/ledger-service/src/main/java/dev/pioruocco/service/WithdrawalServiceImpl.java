package dev.pioruocco.service;

import dev.pioruocco.domain.WithdrawalStatus;
import dev.pioruocco.model.Withdrawal;
import dev.pioruocco.repository.WithdrawalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WithdrawalServiceImpl implements WithdrawalService {
    @Autowired
    private WithdrawalRepository withdrawalRepository;


    @Override
    @Transactional(rollbackFor = Exception.class)
    public Withdrawal requestWithdrawal(Long amount, Long userId) {
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }
        Withdrawal withdrawal = new Withdrawal();
        withdrawal.setAmount(amount);
        withdrawal.setStatus(WithdrawalStatus.PENDING);
        withdrawal.setDate(LocalDateTime.now());
        withdrawal.setUserId(userId);
        return withdrawalRepository.save(withdrawal);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Withdrawal procedWithdrawal(Long withdrawalId, boolean accept) throws Exception {
        Optional<Withdrawal> withdrawalOptional = withdrawalRepository.findById(withdrawalId);

        if (withdrawalOptional.isEmpty()) {
            throw new Exception("withdrawal id is wrong...");
        }

        Withdrawal withdrawal = withdrawalOptional.get();


        withdrawal.setDate(LocalDateTime.now());

        if (accept) {
            withdrawal.setStatus(WithdrawalStatus.SUCCESS);
        } else {
            withdrawal.setStatus(WithdrawalStatus.DECLINE);
        }

        return withdrawalRepository.save(withdrawal);
    }

    @Override
    public List<Withdrawal> getUsersWithdrawalHistory(Long userId) {
        return withdrawalRepository.findByUserId(userId);
    }

    @Override
    public List<Withdrawal> getAllWithdrawalRequest() {
        return withdrawalRepository.findAll();
    }
}
