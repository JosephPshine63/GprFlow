package dev.pioruocco.service;

import dev.pioruocco.model.Coin;
import dev.pioruocco.model.User;
import dev.pioruocco.model.Watchlist;

public interface WatchlistService {

    Watchlist findUserWatchlist(Long userId) throws Exception;

    Watchlist createWatchList(User user);

    Watchlist findById(Long id) throws Exception;

    Coin addItemToWatchlist(Coin coin, User user) throws Exception;
}
