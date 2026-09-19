package dev.pioruocco.service;

import dev.pioruocco.exception.UserException;
import dev.pioruocco.model.PaymentDetails;
import dev.pioruocco.repository.PaymentDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentDetailsServiceImpl implements PaymentDetailsService {

    @Autowired
    private PaymentDetailsRepository paymentDetailsRepository;

    @Override
    public PaymentDetails addPaymentDetails(PaymentDetails request, Long userId) throws UserException {
        String method = request.getMethod() == null ? PaymentDetails.BANK_TRANSFER : request.getMethod();
        if (isBlank(request.getAccountHolderName())) {
            throw new UserException("Account holder name is required");
        }

        // copy field by field so a client can't set id/userId or fields of the other method
        PaymentDetails details = new PaymentDetails();
        details.setMethod(method);
        details.setAccountHolderName(request.getAccountHolderName().trim());
        details.setUserId(userId);

        switch (method) {
            case PaymentDetails.CARD -> {
                if (request.getCardLast4() == null || !request.getCardLast4().matches("\\d{4}")) {
                    throw new UserException("Card last 4 digits are invalid");
                }
                if (isBlank(request.getCardBrand())) {
                    throw new UserException("Card brand is required");
                }
                details.setCardBrand(request.getCardBrand().trim());
                details.setCardLast4(request.getCardLast4());
            }
            case PaymentDetails.BANK_TRANSFER -> {
                if (request.getCountry() == null || !request.getCountry().matches("[A-Z]{2}|OTHER")) {
                    throw new UserException("Country is invalid");
                }
                if (isBlank(request.getBankName()) || isBlank(request.getAccountNumber())) {
                    throw new UserException("Bank name and account number are required");
                }
                if (request.getAccountNumber().length() > 34) {
                    throw new UserException("Account number is too long");
                }
                details.setCountry(request.getCountry());
                details.setBankName(request.getBankName().trim());
                details.setAccountNumber(request.getAccountNumber().trim());
                details.setBankCode(blankToNull(request.getBankCode()));
                details.setSwiftBic(blankToNull(request.getSwiftBic()));
            }
            default -> throw new UserException("Unsupported payout method");
        }
        return paymentDetailsRepository.save(details);
    }

    @Override
    public PaymentDetails getUsersPaymentDetails(Long userId) {
        return paymentDetailsRepository.getPaymentDetailsByUserId(userId);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }
}
