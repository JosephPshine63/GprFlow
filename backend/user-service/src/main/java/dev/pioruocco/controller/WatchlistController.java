package dev.pioruocco.controller;

import dev.pioruocco.model.Coin;
import dev.pioruocco.model.Watchlist;
import dev.pioruocco.service.CoinClient;
import dev.pioruocco.service.WatchlistService;
import dev.pioruocco.util.AuthHeaderResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    @Autowired
    private CoinClient coinClient;

    @GetMapping("/user")
    public ResponseEntity<Watchlist> getUserWatchlist(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie) throws Exception {

        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        Watchlist watchlist = watchlistService.findUserWatchlist(userId);
        enrichWithCoins(watchlist, jwt);
        return ResponseEntity.ok(watchlist);

    }

    @PostMapping("/create")
    public ResponseEntity<Watchlist> createWatchlist(@RequestHeader("X-User-Id") Long userId) {
        Watchlist createdWatchlist = watchlistService.createWatchList(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdWatchlist);
    }

    @GetMapping("/{watchlistId}")
    public ResponseEntity<Watchlist> getWatchlistById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie,
            @PathVariable Long watchlistId) throws Exception {

        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        Watchlist watchlist = watchlistService.findById(watchlistId);
        enrichWithCoins(watchlist, jwt);
        return ResponseEntity.ok(watchlist);

    }

    @PatchMapping("/add/coin/{coinId}")
    public ResponseEntity<Coin> addItemToWatchlist(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie,
            @PathVariable String coinId) throws Exception {

        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        Coin coin = coinClient.findById(coinId, jwt);
        Coin addedCoin = watchlistService.addItemToWatchlist(coin, userId);
        return ResponseEntity.ok(addedCoin);

    }

    private void enrichWithCoins(Watchlist watchlist, String jwt) throws Exception {
        List<Coin> coins = new ArrayList<>();
        for (String coinId : watchlist.getCoinIds()) {
            coins.add(coinClient.findById(coinId, jwt));
        }
        watchlist.setCoins(coins);
    }
}
