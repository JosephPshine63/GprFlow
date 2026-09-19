package dev.pioruocco.controller;

import dev.pioruocco.model.CoinDTO;
import dev.pioruocco.request.PromptBody;
import dev.pioruocco.response.ApiResponse;
import dev.pioruocco.service.ChatBotService;
import dev.pioruocco.service.ReplyLanguage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.concurrent.CompletableFuture;

@RestController()
@RequestMapping("/chat")
public class ChatBotController {

    @Autowired
    private ChatBotService chatBotService;

    @GetMapping("/coin/{coinName}")
    public ResponseEntity<CoinDTO> getCoinDetails(@PathVariable String coinName) {
        CoinDTO coinDTO = chatBotService.getCoinByName(coinName);
        if (coinDTO == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(coinDTO);
    }

    @PostMapping("/bot")
    public CompletableFuture<ResponseEntity<String>> simpleChat(@RequestBody PromptBody promptBody, Locale locale) {
        return chatBotService.simpleChat(promptBody.getPrompt(), ReplyLanguage.from(locale))
                .thenApply(ResponseEntity::ok);
    }

    @PostMapping("/bot/coin")
    public CompletableFuture<ResponseEntity<ApiResponse>> getCoinRealtimeTime(@RequestBody PromptBody promptBody, Locale locale) {
        return chatBotService.getCoinDetails(promptBody.getPrompt(), ReplyLanguage.from(locale))
                .thenApply(ResponseEntity::ok);
    }
}
