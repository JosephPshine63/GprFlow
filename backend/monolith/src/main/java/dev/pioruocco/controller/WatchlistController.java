package dev.pioruocco.controller;

import dev.pioruocco.exception.UserException;
import dev.pioruocco.model.Coin;
import dev.pioruocco.model.User;
import dev.pioruocco.model.Watchlist;
import dev.pioruocco.service.CoinClient;
import dev.pioruocco.service.UserService;
import dev.pioruocco.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {
    private final WatchlistService watchlistService;
    private final UserService userService;

    @Autowired
    private CoinClient coinClient;

    @Autowired
    public WatchlistController(WatchlistService watchlistService,
                               UserService userService) {
        this.watchlistService = watchlistService;
        this.userService = userService;
    }

    @GetMapping("/user")
    public ResponseEntity<Watchlist> getUserWatchlist(
            @RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);
        Watchlist watchlist = watchlistService.findUserWatchlist(user.getId());
        enrichWithCoins(watchlist, jwt);
        return ResponseEntity.ok(watchlist);

    }

    @PostMapping("/create")
    public ResponseEntity<Watchlist> createWatchlist(
            @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        Watchlist createdWatchlist = watchlistService.createWatchList(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdWatchlist);
    }

    @GetMapping("/{watchlistId}")
    public ResponseEntity<Watchlist> getWatchlistById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long watchlistId) throws Exception {

        Watchlist watchlist = watchlistService.findById(watchlistId);
        enrichWithCoins(watchlist, jwt);
        return ResponseEntity.ok(watchlist);

    }

    @PatchMapping("/add/coin/{coinId}")
    public ResponseEntity<Coin> addItemToWatchlist(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String coinId) throws Exception {


        User user = userService.findUserProfileByJwt(jwt);
        Coin coin = coinClient.findById(coinId, jwt);
        Coin addedCoin = watchlistService.addItemToWatchlist(coin, user);
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
