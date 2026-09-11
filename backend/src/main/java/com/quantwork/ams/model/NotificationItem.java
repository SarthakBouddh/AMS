package com.quantwork.ams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class NotificationItem {

    @Id
    private String id;
    private String companyId;
    private String recipientEmail;
    private String title;
    private String message;
    private String type; // APPROVAL, ASSIGNMENT, WARRANTY_ALERT, MAINTENANCE, RETURN_DUE
    private boolean isRead;
    private String createdAt;

    public NotificationItem() {}

    public NotificationItem(String id, String companyId, String recipientEmail, String title, String message, String type, boolean isRead, String createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.recipientEmail = recipientEmail;
        this.title = title;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
