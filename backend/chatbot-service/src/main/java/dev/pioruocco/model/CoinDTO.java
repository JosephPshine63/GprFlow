package dev.pioruocco.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Date;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CoinDTO {
    private String id;
    private String symbol;
    private String name;
    private String image;
    private double currentPrice;
    private double marketCap;
    private int marketCapRank;
    private double totalVolume;
    private double high24h;
    private double low24h;
    private double priceChange24h;
    private double priceChangePercentage24h;
    private double marketCapChange24h;
    private double marketCapChangePercentage24h;
    private double circulatingSupply;
    private double totalSupply;
    //    private double maxSupply;
    private long ath;
    private long athChangePercentage;
    private Date athDate;
    private long atl;
    private long atlChangePercentage;
    private Date atlDate;
    private Date lastUpdated;

}
