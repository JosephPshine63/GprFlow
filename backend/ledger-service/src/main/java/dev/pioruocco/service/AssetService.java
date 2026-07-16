package dev.pioruocco.service;


import dev.pioruocco.model.Asset;
import dev.pioruocco.model.Coin;

import java.util.List;

public interface AssetService {
    Asset createAsset(Long userId, Coin coin, double quantity);

    Asset getAssetById(Long assetId);

    Asset getAssetByUserAndId(Long userId, Long assetId);

    List<Asset> getUsersAssets(Long userId);

    Asset updateAsset(Long assetId, double quantity) throws Exception;

    Asset findAssetByUserIdAndCoinId(Long userId, String coinId) throws Exception;

    void deleteAsset(Long assetId);


}
