package dev.pioruocco.controller;

import dev.pioruocco.model.Asset;
import dev.pioruocco.model.User;
import dev.pioruocco.service.AssetService;
import dev.pioruocco.service.CoinClient;
import dev.pioruocco.service.UserService;
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
    private UserService userService;

    @Autowired
    private CoinClient coinClient;

    @Autowired
    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping("/{assetId}")
    public ResponseEntity<Asset> getAssetById(
            @PathVariable Long assetId,
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Asset asset = assetService.getAssetById(assetId);
        if (!asset.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        asset.setCoin(coinClient.findById(asset.getCoinId(), jwt));
        return ResponseEntity.ok().body(asset);
    }

    @GetMapping("/coin/{coinId}/user")
    public ResponseEntity<Asset> getAssetByUserIdAndCoinId(
            @PathVariable String coinId,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);
        Asset asset = assetService.findAssetByUserIdAndCoinId(user.getId(), coinId);
        if (asset != null) {
            asset.setCoin(coinClient.findById(asset.getCoinId(), jwt));
        }
        return ResponseEntity.ok().body(asset);
    }

    @GetMapping()
    public ResponseEntity<List<Asset>> getAssetsForUser(
            @RequestHeader("Authorization") String jwt
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        List<Asset> assets = assetService.getUsersAssets(user.getId());
        for (Asset asset : assets) {
            asset.setCoin(coinClient.findById(asset.getCoinId(), jwt));
        }
        return ResponseEntity.ok().body(assets);
    }
}
