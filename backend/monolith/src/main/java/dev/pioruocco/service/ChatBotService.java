package dev.pioruocco.service;

import dev.pioruocco.model.CoinDTO;
import dev.pioruocco.response.ApiResponse;

public interface ChatBotService {
    ApiResponse getCoinDetails(String coinName);

    CoinDTO getCoinByName(String coinName);

    String simpleChat(String prompt);
}
