package dev.pioruocco.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.pioruocco.client.CoinGeckoClient;
import dev.pioruocco.client.GeminiClient;
import dev.pioruocco.model.CoinDTO;
import dev.pioruocco.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class ChatBotServiceImpl implements ChatBotService {

    private static final Logger log = LoggerFactory.getLogger(ChatBotServiceImpl.class);

    @Autowired
    private GeminiClient geminiClient;

    @Autowired
    private CoinGeckoClient coinGeckoClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public CoinDTO getCoinByName(String coinName) {
        return coinGeckoClient.findByNameOrId(coinName).orElse(null);
    }

    @Override
    @Async("geminiExecutor")
    public CompletableFuture<String> simpleChat(String prompt, ReplyLanguage language) {
        if (!geminiClient.isEnabled()) {
            return CompletableFuture.completedFuture(language.notConfigured());
        }
        try {
            JsonNode response = geminiClient.generateSimple(prompt, language);
            String text = geminiClient.extractText(response);
            return CompletableFuture.completedFuture(text != null ? text : "");
        } catch (Exception e) {
            log.warn("Gemini simple chat call failed", e);
            return CompletableFuture.completedFuture(language.failed());
        }
    }

    @Override
    @Async("geminiExecutor")
    public CompletableFuture<ApiResponse> getCoinDetails(String prompt, ReplyLanguage language) {
        if (!geminiClient.isEnabled()) {
            return CompletableFuture.completedFuture(
                    new ApiResponse(language.notConfigured(), false));
        }
        try {
            JsonNode initial = geminiClient.generateInitial(prompt, language);
            JsonNode functionCall = geminiClient.extractFunctionCall(initial);

            if (functionCall == null) {
                String text = geminiClient.extractText(initial);
                return CompletableFuture.completedFuture(
                        new ApiResponse(text != null ? text : language.unsure(), true));
            }

            String currencyName = functionCall.path("args").path("currencyName").asText(null);
            if (currencyName == null || currencyName.isBlank()) {
                return CompletableFuture.completedFuture(new ApiResponse(language.whichCoin(), false));
            }

            Optional<CoinDTO> coin = coinGeckoClient.findByNameOrId(currencyName);
            if (coin.isEmpty()) {
                return CompletableFuture.completedFuture(
                        new ApiResponse(language.noMarketData(currencyName), false));
            }

            JsonNode coinJson = objectMapper.valueToTree(coin.get());
            JsonNode finalResponse = geminiClient.generateWithFunctionResult(
                    prompt, language, GeminiClient.COIN_TOOL_NAME, functionCall.path("args"),
                    geminiClient.extractThoughtSignature(initial), coinJson);
            String text = geminiClient.extractText(finalResponse);

            return CompletableFuture.completedFuture(
                    new ApiResponse(text != null ? text : language.unsure(), true));
        } catch (Exception e) {
            log.warn("Gemini coin chat call failed", e);
            return CompletableFuture.completedFuture(
                    new ApiResponse(language.failed(), false));
        }
    }
}
