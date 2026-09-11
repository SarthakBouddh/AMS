package com.quantwork.ams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resource_bookings")
public class ResourceBooking {

    @Id
    private String id;
    private String companyId;
    private String resourceId;
    private String resourceName;
    private String requestedBy;
    private String employeeName;
    private String startTime;
    private String endTime;
    private String date;
    private String purpose;
    private String status; // CONFIRMED, CANCELLED

    public ResourceBooking() {}

    public ResourceBooking(String id, String companyId, String resourceId, String resourceName, String requestedBy, String employeeName, String startTime, String endTime, String date, String purpose, String status) {
        this.id = id;
        this.companyId = companyId;
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.requestedBy = requestedBy;
        this.employeeName = employeeName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.date = date;
        this.purpose = purpose;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
