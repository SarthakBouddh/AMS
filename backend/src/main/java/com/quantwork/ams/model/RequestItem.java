package com.quantwork.ams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "requests")
public class RequestItem {

    @Id
    private String id;
    private String companyId;
    private String requestType; // NEW_ASSET, REPLACEMENT, TRANSFER, RETURN, RESOURCE_BOOKING, MAINTENANCE, SOFTWARE_LICENSE
    private String requestedBy;
    private String employeeName;
    private String targetAssetId;
    private String targetAssetName;
    private String managerStatus; // PENDING, APPROVED, REJECTED
    private String adminStatus;   // PENDING, ALLOCATED, REJECTED
    private String reasonNotes;
    private String createdAt;

    public RequestItem() {}

    public RequestItem(String id, String companyId, String requestType, String requestedBy, String employeeName, String targetAssetId, String targetAssetName, String managerStatus, String adminStatus, String reasonNotes, String createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.requestType = requestType;
        this.requestedBy = requestedBy;
        this.employeeName = employeeName;
        this.targetAssetId = targetAssetId;
        this.targetAssetName = targetAssetName;
        this.managerStatus = managerStatus;
        this.adminStatus = adminStatus;
        this.reasonNotes = reasonNotes;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getTargetAssetId() { return targetAssetId; }
    public void setTargetAssetId(String targetAssetId) { this.targetAssetId = targetAssetId; }

    public String getTargetAssetName() { return targetAssetName; }
    public void setTargetAssetName(String targetAssetName) { this.targetAssetName = targetAssetName; }

    public String getManagerStatus() { return managerStatus; }
    public void setManagerStatus(String managerStatus) { this.managerStatus = managerStatus; }

    public String getAdminStatus() { return adminStatus; }
    public void setAdminStatus(String adminStatus) { this.adminStatus = adminStatus; }

    public String getReasonNotes() { return reasonNotes; }
    public void setReasonNotes(String reasonNotes) { this.reasonNotes = reasonNotes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
