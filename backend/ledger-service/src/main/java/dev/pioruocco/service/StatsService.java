package dev.pioruocco.service;

import dev.pioruocco.domain.StatsPeriod;
import dev.pioruocco.exception.WalletException;
import dev.pioruocco.response.StatsResponse;

public interface StatsService {

    StatsResponse getUserStats(Long userId, StatsPeriod period) throws WalletException;
}
