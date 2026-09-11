package com.quantwork.ams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "maintenance_tickets")
public class MaintenanceTicket {

    @Id
    private String id;
    private String companyId;
    private String assetId;
    private String assetName;
    private String assetTag;
    private String maintenanceType; // REPAIR or REPLACE
    private String issueKeyword;    // Predefined keyword e.g. "Damaged from Vendor (Unit Replacement)", "Screen Cracked", "Hardware Failure", etc.
    private String reportedBy;
    private String employeeName;
    private String vendorId;
    private String vendorName;
    private String problemDescription;
    private String priority; // LOW, MEDIUM, HIGH, URGENT
    private String status;   // OPEN, IN_PROGRESS, UNDER_REPAIR, SENT_FOR_REPLACEMENT, RESOLVED, REPLACED
    private String technicianAssigned;
    private Double repairCost;
    private String resolutionNotes;
    private String createdAt;
    private String resolvedAt;

    public MaintenanceTicket() {}

    public MaintenanceTicket(String id, String companyId, String assetId, String assetName, String assetTag, String maintenanceType, String issueKeyword, String reportedBy, String employeeName, String vendorId, String vendorName, String problemDescription, String priority, String status, String technicianAssigned, Double repairCost, String resolutionNotes, String createdAt, String resolvedAt) {
        this.id = id;
        this.companyId = companyId;
        this.assetId = assetId;
        this.assetName = assetName;
        this.assetTag = assetTag;
        this.maintenanceType = maintenanceType;
        this.issueKeyword = issueKeyword;
        this.reportedBy = reportedBy;
        this.employeeName = employeeName;
        this.vendorId = vendorId;
        this.vendorName = vendorName;
        this.problemDescription = problemDescription;
        this.priority = priority;
        this.status = status;
        this.technicianAssigned = technicianAssigned;
        this.repairCost = repairCost;
        this.resolutionNotes = resolutionNotes;
        this.createdAt = createdAt;
        this.resolvedAt = resolvedAt;
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

    public String getMaintenanceType() { return maintenanceType; }
    public void setMaintenanceType(String maintenanceType) { this.maintenanceType = maintenanceType; }

    public String getIssueKeyword() { return issueKeyword; }
    public void setIssueKeyword(String issueKeyword) { this.issueKeyword = issueKeyword; }

    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getVendorId() { return vendorId; }
    public void setVendorId(String vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getProblemDescription() { return problemDescription; }
    public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTechnicianAssigned() { return technicianAssigned; }
    public void setTechnicianAssigned(String technicianAssigned) { this.technicianAssigned = technicianAssigned; }

    public Double getRepairCost() { return repairCost; }
    public void setRepairCost(Double repairCost) { this.repairCost = repairCost; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(String resolvedAt) { this.resolvedAt = resolvedAt; }
}
