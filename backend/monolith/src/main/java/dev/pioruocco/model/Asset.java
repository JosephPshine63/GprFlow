package dev.pioruocco.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "asset")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double quantity;
    private double buyPrice;

    private String coinId;

    // Populated at read time from coin-service via CoinClient, never persisted.
    @Transient
    private Coin coin;

    @ManyToOne
    private User user;


}

