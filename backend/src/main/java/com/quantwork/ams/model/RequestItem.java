package com.quantwork.ams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "requests")
public class RequestItem {

    @Id
    private String id;
    private String companyId;
    private String requestType; // NEW_ASSET, REPLACEMENT, TRANSFER, RETURN, RESOURCE_BOOKING, MAINTENANCE, SOFTWARE_LICENSE
    private String requestCategory; // Hardware, Software, Furniture, Accessories
    private String requestedBy;
    private String employeeId;
    private String employeeName;
    private String department;
    private String targetAssetId;
    private String targetAssetName;
    private String managerId;
    private String managerName;
    private String managerEmail;
    private String priority; // Low, Medium, High, Critical
    private String quantity;
    private String location;
    private String justification;
    private String managerStatus; // PENDING, APPROVED, REJECTED
    private String adminStatus;   // PENDING, ALLOCATED, REJECTED
    private String status;        // PENDING, APPROVED, REJECTED
    private String reasonNotes;
    private String managerComment;
    private String createdAt;
    private String updatedAt;
    private String approvedAt;
    private String rejectedAt;
    private String approvedByUserId;
    private String rejectedByUserId;
    private String serialNo;
    private String assetTag;
    private String condition;
    private String adminNotes;
    private String allocationDate;
    private String originCategory; // EMPLOYEE, MANAGER, ADMIN_DIRECT

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

    public String getRequestCategory() { return requestCategory; }
    public void setRequestCategory(String requestCategory) { this.requestCategory = requestCategory; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getTargetAssetId() { return targetAssetId; }
    public void setTargetAssetId(String targetAssetId) { this.targetAssetId = targetAssetId; }

    public String getTargetAssetName() { return targetAssetName; }
    public void setTargetAssetName(String targetAssetName) { this.targetAssetName = targetAssetName; }

    public String getManagerId() { return managerId; }
    public void setManagerId(String managerId) { this.managerId = managerId; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public String getManagerEmail() { return managerEmail; }
    public void setManagerEmail(String managerEmail) { this.managerEmail = managerEmail; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }

    public String getManagerStatus() { return managerStatus; }
    public void setManagerStatus(String managerStatus) { this.managerStatus = managerStatus; }

    public String getAdminStatus() { return adminStatus; }
    public void setAdminStatus(String adminStatus) { this.adminStatus = adminStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReasonNotes() { return reasonNotes; }
    public void setReasonNotes(String reasonNotes) { this.reasonNotes = reasonNotes; }

    public String getManagerComment() { return managerComment; }
    public void setManagerComment(String managerComment) { this.managerComment = managerComment; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getApprovedAt() { return approvedAt; }
    public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }

    public String getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(String rejectedAt) { this.rejectedAt = rejectedAt; }

    public String getApprovedByUserId() { return approvedByUserId; }
    public void setApprovedByUserId(String approvedByUserId) { this.approvedByUserId = approvedByUserId; }

    public String getRejectedByUserId() { return rejectedByUserId; }
    public void setRejectedByUserId(String rejectedByUserId) { this.rejectedByUserId = rejectedByUserId; }

    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String serialNo) { this.serialNo = serialNo; }

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getAllocationDate() { return allocationDate; }
    public void setAllocationDate(String allocationDate) { this.allocationDate = allocationDate; }

    public String getOriginCategory() { return originCategory; }
    public void setOriginCategory(String originCategory) { this.originCategory = originCategory; }
}
