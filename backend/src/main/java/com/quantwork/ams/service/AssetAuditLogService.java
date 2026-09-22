package com.quantwork.ams.service;

import com.quantwork.ams.model.AssetAuditLog;
import com.quantwork.ams.repository.AssetAuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class AssetAuditLogService {

    @Autowired
    private AssetAuditLogRepository assetAuditLogRepository;

    public AssetAuditLog recordAssetEvent(String assetId, String companyId, String assetTag, String actionType,
                                         String description, String performedBy, String userId) {
        if (assetId == null || assetId.trim().isEmpty()) {
            throw new IllegalArgumentException("assetId is required for audit logging");
        }

        AssetAuditLog log = new AssetAuditLog();
        log.setId(UUID.randomUUID().toString());
        log.setAssetId(assetId);
        log.setCompanyId(companyId != null ? companyId : "SYSTEM");
        log.setAssetTag(assetTag != null ? assetTag : "UNKNOWN");
        log.setActionType(actionType != null ? actionType : "ASSET_EVENT");
        log.setDescription(description != null ? description : "Asset activity recorded.");
        log.setPerformedBy(performedBy != null ? performedBy : "System");
        log.setUserId(userId);
        log.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        return assetAuditLogRepository.save(log);
    }

    public List<AssetAuditLog> getAuditLogsForAsset(String assetId) {
        if (assetId == null || assetId.trim().isEmpty()) {
            return List.of();
        }
        return assetAuditLogRepository.findByAssetIdOrderByCreatedAtDesc(assetId);
    }

    public List<AssetAuditLog> getAuditLogsForCompany(String companyId) {
        if (companyId == null || companyId.trim().isEmpty() || "ALL".equalsIgnoreCase(companyId)) {
            return assetAuditLogRepository.findAllByOrderByCreatedAtDesc();
        }
        return assetAuditLogRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }
}
