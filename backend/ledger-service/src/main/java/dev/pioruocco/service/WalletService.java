package dev.pioruocco.service;


import dev.pioruocco.exception.WalletException;
import dev.pioruocco.model.Order;
import dev.pioruocco.model.Wallet;

public interface WalletService {


    Wallet getUserWallet(Long userId) throws WalletException;

    Wallet addBalanceToWallet(Wallet wallet, Long money) throws WalletException;

    Wallet findWalletById(Long id) throws WalletException;

    Wallet walletToWalletTransfer(Long senderId, Wallet receiverWallet, Long amount) throws WalletException;

    Wallet payOrderPayment(Order order, Long userId) throws WalletException;


}
