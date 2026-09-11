package com.quantwork.ams.repository;

import com.quantwork.ams.model.Asset;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends MongoRepository<Asset, String> {
    List<Asset> findByCategory(String category);
    List<Asset> findByStatus(String status);
    List<Asset> findByOwnerId(String ownerId);
    List<Asset> findByNameContainingIgnoreCaseOrAssetTagContainingIgnoreCaseOrLocationContainingIgnoreCase(
            String name, String assetTag, String location);
    void deleteByCompanyId(String companyId);
}
