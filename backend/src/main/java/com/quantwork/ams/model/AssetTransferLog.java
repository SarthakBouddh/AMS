package com.quantwork.ams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "asset_transfers")
public class AssetTransferLog {

    @Id
    private String id;
    private String companyId;
    private String assetId;
    private String assetName;
    private String assetTag;
    private String fromEmployeeId;
    private String fromEmployeeName;
    private String toEmployeeId;
    private String toEmployeeName;
    private String fromLocation;
    private String toLocation;
    private String transferredBy;
    private String transferDate;
    private String notes;

    public AssetTransferLog() {}

    public AssetTransferLog(String id, String companyId, String assetId, String assetName, String assetTag, String fromEmployeeId, String fromEmployeeName, String toEmployeeId, String toEmployeeName, String fromLocation, String toLocation, String transferredBy, String transferDate, String notes) {
        this.id = id;
        this.companyId = companyId;
        this.assetId = assetId;
        this.assetName = assetName;
        this.assetTag = assetTag;
        this.fromEmployeeId = fromEmployeeId;
        this.fromEmployeeName = fromEmployeeName;
        this.toEmployeeId = toEmployeeId;
        this.toEmployeeName = toEmployeeName;
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
        this.transferredBy = transferredBy;
        this.transferDate = transferDate;
        this.notes = notes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getAssetId() { return assetId; }
    public void setAssetId(String assetId) { this.assetId = assetId; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public String getFromEmployeeId() { return fromEmployeeId; }
    public void setFromEmployeeId(String fromEmployeeId) { this.fromEmployeeId = fromEmployeeId; }

    public String getFromEmployeeName() { return fromEmployeeName; }
    public void setFromEmployeeName(String fromEmployeeName) { this.fromEmployeeName = fromEmployeeName; }

    public String getToEmployeeId() { return toEmployeeId; }
    public void setToEmployeeId(String toEmployeeId) { this.toEmployeeId = toEmployeeId; }

    public String getToEmployeeName() { return toEmployeeName; }
    public void setToEmployeeName(String toEmployeeName) { this.toEmployeeName = toEmployeeName; }

    public String getFromLocation() { return fromLocation; }
    public void setFromLocation(String fromLocation) { this.fromLocation = fromLocation; }

    public String getToLocation() { return toLocation; }
    public void setToLocation(String toLocation) { this.toLocation = toLocation; }

    public String getTransferredBy() { return transferredBy; }
    public void setTransferredBy(String transferredBy) { this.transferredBy = transferredBy; }

    public String getTransferDate() { return transferDate; }
    public void setTransferDate(String transferDate) { this.transferDate = transferDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
