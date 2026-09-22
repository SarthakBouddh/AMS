package com.quantwork.ams.repository;

import com.quantwork.ams.model.AssetAuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetAuditLogRepository extends MongoRepository<AssetAuditLog, String> {
    List<AssetAuditLog> findByAssetIdOrderByCreatedAtDesc(String assetId);
    List<AssetAuditLog> findByCompanyIdOrderByCreatedAtDesc(String companyId);
    List<AssetAuditLog> findAllByOrderByCreatedAtDesc();
}
