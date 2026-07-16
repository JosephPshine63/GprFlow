package dev.pioruocco.service;

import dev.pioruocco.model.Withdrawal;

import java.util.List;

public interface WithdrawalService {

    Withdrawal requestWithdrawal(Long amount, Long userId);

    Withdrawal procedWithdrawal(Long withdrawalId, boolean accept) throws Exception;

    List<Withdrawal> getUsersWithdrawalHistory(Long userId);

    List<Withdrawal> getAllWithdrawalRequest();
}
