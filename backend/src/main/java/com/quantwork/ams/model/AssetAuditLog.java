package com.quantwork.ams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "asset_audit_logs")
public class AssetAuditLog {

    @Id
    private String id;
    private String assetId;
    private String companyId;
    private String assetTag;
    private String actionType;
    private String description;
    private String performedBy;
    private String userId;
    private String createdAt;

    public AssetAuditLog() {
    }

    public AssetAuditLog(String id, String assetId, String companyId, String assetTag, String actionType,
                        String description, String performedBy, String userId, String createdAt) {
        this.id = id;
        this.assetId = assetId;
        this.companyId = companyId;
        this.assetTag = assetTag;
        this.actionType = actionType;
        this.description = description;
        this.performedBy = performedBy;
        this.userId = userId;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAssetId() { return assetId; }
    public void setAssetId(String assetId) { this.assetId = assetId; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
