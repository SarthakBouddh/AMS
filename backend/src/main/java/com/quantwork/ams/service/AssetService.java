package com.quantwork.ams.service;

import com.quantwork.ams.model.Asset;
import com.quantwork.ams.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    public List<Asset> getAllAssets(String search, String status, String category, String companyId) {
        return getAllAssets(search, status, category, companyId, null, null, null);
    }

    public List<Asset> getAllAssets(String search, String status, String category, String companyId, String assetName, String ownerName, String vendorId) {
        List<Asset> allAssets = assetRepository.findAll();

        return allAssets.stream()
                // Multi-Tenant Isolation Check
                .filter(a -> companyId == null || companyId.trim().isEmpty() || "ALL".equalsIgnoreCase(companyId) || (a.getCompanyId() != null && a.getCompanyId().equals(companyId)))
                .filter(a -> status == null || status.equalsIgnoreCase("All") || (a.getStatus() != null && a.getStatus().equalsIgnoreCase(status)))
                .filter(a -> category == null || category.equalsIgnoreCase("All") || (a.getCategory() != null && a.getCategory().equalsIgnoreCase(category)))
                .filter(a -> assetName == null || assetName.trim().isEmpty() || (a.getName() != null && a.getName().toLowerCase().contains(assetName.toLowerCase().trim())))
                .filter(a -> ownerName == null || ownerName.trim().isEmpty() || (a.getOwnerName() != null && a.getOwnerName().toLowerCase().contains(ownerName.toLowerCase().trim())))
                .filter(a -> vendorId == null || vendorId.trim().isEmpty() || vendorId.equalsIgnoreCase("All") || (a.getVendorId() != null && a.getVendorId().equalsIgnoreCase(vendorId)))
                .filter(a -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String query = search.toLowerCase();
                    return (a.getName() != null && a.getName().toLowerCase().contains(query))
                            || (a.getAssetTag() != null && a.getAssetTag().toLowerCase().contains(query))
                            || (a.getLocation() != null && a.getLocation().toLowerCase().contains(query))
                            || (a.getOwnerName() != null && a.getOwnerName().toLowerCase().contains(query))
                            || (a.getVendorName() != null && a.getVendorName().toLowerCase().contains(query));
                })
                .collect(Collectors.toList());
    }

    public Optional<Asset> getAssetById(String id) {
        return assetRepository.findById(id);
    }

    public Asset saveAsset(Asset asset) {
        if (asset.getId() == null || asset.getId().trim().isEmpty()) {
            asset.setId(UUID.randomUUID().toString());
        }
        if (asset.getAssetTag() == null || asset.getAssetTag().trim().isEmpty()) {
            asset.setAssetTag("AST-" + (1000 + (int)(Math.random() * 9000)));
        }

        return assetRepository.save(asset);
    }

    public boolean deleteAsset(String id) {
        if (assetRepository.existsById(id)) {
            assetRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public void initSeedData(List<Asset> seedAssets) {
        if (assetRepository.count() == 0) {
            assetRepository.saveAll(seedAssets);
        }
    }

    public void deleteAssetsByCompany(String companyId) {
        if (companyId == null || companyId.trim().isEmpty()) return;
        assetRepository.deleteByCompanyId(companyId);
    }
}
