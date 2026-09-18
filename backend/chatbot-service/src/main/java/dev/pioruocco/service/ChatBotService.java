package dev.pioruocco.service;

import dev.pioruocco.model.CoinDTO;
import dev.pioruocco.response.ApiResponse;

import java.util.concurrent.CompletableFuture;

public interface ChatBotService {
    CompletableFuture<ApiResponse> getCoinDetails(String prompt);

    CoinDTO getCoinByName(String coinName);

    CompletableFuture<String> simpleChat(String prompt);
}
