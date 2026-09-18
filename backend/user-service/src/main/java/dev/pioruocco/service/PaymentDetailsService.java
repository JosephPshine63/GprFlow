package dev.pioruocco.service;

import dev.pioruocco.model.PaymentDetails;

public interface PaymentDetailsService {
    PaymentDetails addPaymentDetails(String accountNumber,
                                     String accountHolderName,
                                     String ifsc,
                                     String bankName,
                                     Long userId
    );

    PaymentDetails getUsersPaymentDetails(Long userId);


}
