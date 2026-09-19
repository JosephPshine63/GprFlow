package dev.pioruocco.service;

import dev.pioruocco.exception.UserException;
import dev.pioruocco.model.PaymentDetails;

public interface PaymentDetailsService {
    PaymentDetails addPaymentDetails(PaymentDetails request, Long userId) throws UserException;

    PaymentDetails getUsersPaymentDetails(Long userId);
}
