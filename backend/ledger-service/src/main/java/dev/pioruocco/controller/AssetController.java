package dev.pioruocco.controller;

import dev.pioruocco.model.Asset;
import dev.pioruocco.service.AssetService;
import dev.pioruocco.service.CoinClient;
import dev.pioruocco.util.AuthHeaderResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {
    private final AssetService assetService;

    @Autowired
    private CoinClient coinClient;

    @Autowired
    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping("/{assetId}")
    public ResponseEntity<Asset> getAssetById(
            @PathVariable Long assetId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie) throws Exception {
        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        Asset asset = assetService.getAssetById(assetId);
        if (!asset.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        asset.setCoin(coinClient.findById(asset.getCoinId(), jwt));
        return ResponseEntity.ok().body(asset);
    }

    @GetMapping("/coin/{coinId}/user")
    public ResponseEntity<Asset> getAssetByUserIdAndCoinId(
            @PathVariable String coinId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie
    ) throws Exception {
        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        Asset asset = assetService.findAssetByUserIdAndCoinId(userId, coinId);
        if (asset != null) {
            asset.setCoin(coinClient.findById(asset.getCoinId(), jwt));
        }
        return ResponseEntity.ok().body(asset);
    }

    @GetMapping()
    public ResponseEntity<List<Asset>> getAssetsForUser(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @CookieValue(value = "jwt", required = false) String jwtCookie
    ) throws Exception {
        String jwt = AuthHeaderResolver.resolveBearerToken(authHeader, jwtCookie);
        List<Asset> assets = assetService.getUsersAssets(userId);
        for (Asset asset : assets) {
            asset.setCoin(coinClient.findById(asset.getCoinId(), jwt));
        }
        return ResponseEntity.ok().body(assets);
    }
}
