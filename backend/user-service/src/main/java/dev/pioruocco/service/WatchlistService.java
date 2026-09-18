package dev.pioruocco.service;

import dev.pioruocco.model.Coin;
import dev.pioruocco.model.Watchlist;

public interface WatchlistService {

    Watchlist findUserWatchlist(Long userId) throws Exception;

    Watchlist createWatchList(Long userId);

    Watchlist findById(Long id) throws Exception;

    Coin addItemToWatchlist(Coin coin, Long userId) throws Exception;
}
