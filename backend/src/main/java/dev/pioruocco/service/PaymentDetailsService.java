package dev.pioruocco.service;

import dev.pioruocco.model.PaymentDetails;
import dev.pioruocco.model.User;

public interface PaymentDetailsService {
    PaymentDetails addPaymentDetails(String accountNumber,
                                     String accountHolderName,
                                     String ifsc,
                                     String bankName,
                                     User user
    );

    PaymentDetails getUsersPaymentDetails(User user);


}
