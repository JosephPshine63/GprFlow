package dev.pioruocco.client;

import com.fasterxml.jackson.databind.JsonNode;
import dev.pioruocco.model.CoinDTO;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Optional;

@Component
public class CoinGeckoClient {

    private final RestClient restClient;

    public CoinGeckoClient(RestClient externalApiRestClient) {
        this.restClient = externalApiRestClient;
    }

    // Public, unauthenticated CoinGecko lookup — same known inconsistency as
    // coin-service's own CoinGecko integration, not something this rewrite fixes.
    public Optional<CoinDTO> findByNameOrId(String currencyName) {
        try {
            JsonNode body = restClient.get()
                    .uri("https://api.coingecko.com/api/v3/coins/{id}", currencyName.toLowerCase())
                    .retrieve()
                    .body(JsonNode.class);
            return Optional.ofNullable(body).map(this::toCoinDTO);
        } catch (RestClientException e) {
            return Optional.empty();
        }
    }

    private CoinDTO toCoinDTO(JsonNode body) {
        JsonNode image = body.path("image");
        JsonNode marketData = body.path("market_data");

        CoinDTO coin = new CoinDTO();
        coin.setId(body.path("id").asText(null));
        coin.setSymbol(body.path("symbol").asText(null));
        coin.setName(body.path("name").asText(null));
        coin.setImage(image.path("large").asText(null));
        coin.setCurrentPrice(marketData.path("current_price").path("usd").asDouble());
        coin.setMarketCap(marketData.path("market_cap").path("usd").asDouble());
        coin.setMarketCapRank(body.path("market_cap_rank").asInt());
        coin.setTotalVolume(marketData.path("total_volume").path("usd").asDouble());
        coin.setHigh24h(marketData.path("high_24h").path("usd").asDouble());
        coin.setLow24h(marketData.path("low_24h").path("usd").asDouble());
        coin.setPriceChange24h(marketData.path("price_change_24h").asDouble());
        coin.setPriceChangePercentage24h(marketData.path("price_change_percentage_24h").asDouble());
        coin.setMarketCapChange24h(marketData.path("market_cap_change_24h").asDouble());
        coin.setMarketCapChangePercentage24h(marketData.path("market_cap_change_percentage_24h").asDouble());
        coin.setCirculatingSupply(marketData.path("circulating_supply").asDouble());
        coin.setTotalSupply(marketData.path("total_supply").asDouble());
        return coin;
    }
}
