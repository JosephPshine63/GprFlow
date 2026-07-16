package dev.pioruocco.service;

import dev.pioruocco.model.Coin;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Component
public class CoinClient {

    @Value("${coin.service.url}")
    private String coinServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Coin findById(String coinId, String jwt) throws Exception {
        String url = coinServiceUrl + "/api/coins/" + coinId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", jwt);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Coin> response = restTemplate.exchange(url, HttpMethod.GET, entity, Coin.class);
            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            throw new Exception("invalid coin id");
        }
    }
}
