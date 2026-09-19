package dev.pioruocco.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "payment_details")
@Data
public class PaymentDetails {

    public static final String BANK_TRANSFER = "BANK_TRANSFER";
    public static final String CARD = "CARD";

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    // null on rows saved before payout methods existed: those are bank transfers
    private String method;

    // ISO 3166-1 alpha-2, or OTHER; bank transfers only
    private String country;

    private String accountNumber;

    private String accountHolderName;

    private String bankName;

    // routing number, sort code, IFSC or BSB depending on the country
    private String bankCode;

    private String swiftBic;

    // cards: never the full number, only what's needed to recognise it
    private String cardBrand;

    private String cardLast4;

    // rows saved while the form was India-only keep their code here
    private String ifsc;

    private Long userId;

}
