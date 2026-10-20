package dev.pioruocco.service;


import dev.pioruocco.model.Asset;
import dev.pioruocco.model.Coin;
import dev.pioruocco.repository.AssetsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.List;

@Service
public class AssetServiceImplementation implements AssetService {
    private final AssetsRepository assetRepository;

    @Autowired
    public AssetServiceImplementation(AssetsRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Asset createAsset(Long userId, Coin coin, double quantity) {
        Asset asset = new Asset();

        asset.setQuantity(quantity);
        asset.setBuyPrice(coin.getCurrentPrice());
        asset.setCoinId(coin.getId());
        asset.setUserId(userId);

        return assetRepository.save(asset);
    }

    public Asset getAssetById(Long assetId) {
        return assetRepository.findById(assetId)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found"));
    }

    @Override
    public Asset getAssetByUserAndId(Long userId, Long assetId) {
        return assetRepository.findByIdAndUserId(assetId, userId);
    }

    @Override
    public List<Asset> getUsersAssets(Long userId) {
        return assetRepository.findByUserId(userId);
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public Asset updateAsset(Long assetId, double quantity) throws Exception {

        Asset oldAsset = getAssetById(assetId);
        if (oldAsset == null) {
            throw new Exception("Asset not found...");
        }
        oldAsset.setQuantity(quantity + oldAsset.getQuantity());

        return assetRepository.save(oldAsset);
    }

    // Keeps buyPrice as the quantity-weighted average, otherwise P/L on a re-bought coin
    // is measured against the first purchase only.
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Asset addToAsset(Long assetId, double quantity, double price) throws Exception {
        Asset asset = getAssetById(assetId);

        BigDecimal oldQty = BigDecimal.valueOf(asset.getQuantity());
        BigDecimal addedQty = BigDecimal.valueOf(quantity);
        BigDecimal newQty = oldQty.add(addedQty);
        if (newQty.signum() <= 0) {
            throw new Exception("quantity should be > 0");
        }

        BigDecimal cost = oldQty.multiply(BigDecimal.valueOf(asset.getBuyPrice()))
                .add(addedQty.multiply(BigDecimal.valueOf(price)));

        asset.setQuantity(newQty.doubleValue());
        asset.setBuyPrice(cost.divide(newQty, MathContext.DECIMAL64).doubleValue());

        return assetRepository.save(asset);
    }

    @Override
    public Asset findAssetByUserIdAndCoinId(Long userId, String coinId) throws Exception {
        return assetRepository.findByUserIdAndCoinId(userId, coinId);
    }


    public void deleteAsset(Long assetId) {
        assetRepository.deleteById(assetId);
    }

}
