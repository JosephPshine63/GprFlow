package dev.pioruocco.controller;

import dev.pioruocco.domain.StatsPeriod;
import dev.pioruocco.response.StatsResponse;
import dev.pioruocco.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    // Under /api/wallet so the gateway's existing protected prefix and route cover it.
    @GetMapping("/api/wallet/stats")
    public ResponseEntity<StatsResponse> getUserStats(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "30d") String period) throws Exception {
        Optional<StatsPeriod> parsed = StatsPeriod.fromParam(period);
        if (parsed.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(statsService.getUserStats(userId, parsed.get()));
    }
}
