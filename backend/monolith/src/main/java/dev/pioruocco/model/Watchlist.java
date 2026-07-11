package dev.pioruocco.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "watchlist")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Watchlist {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne
    private User user;

    @ElementCollection
    private List<String> coinIds = new ArrayList<>();

    // Populated at read time from coin-service via CoinClient, never persisted.
    @Transient
    private List<Coin> coins = new ArrayList<>();
}

