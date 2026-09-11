package com.quantwork.ams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "assets")
public class Asset {

    @Id
    private String id;
    private String companyId;
    private String companyName;
    private String assetTag;
    private String name;
    private String category;
    private String status; // AVAILABLE, ASSIGNED, IN_USE, RESERVED, UNDER_MAINTENANCE, LOST, DAMAGED, RETIRED, DISPOSED
    private String location;
    private String ownerId;
    private String ownerName;
    private Double value;
    private String condition;
    private String serialNumber;
    private String macAddress;
    private String imei;
    private String vendorId;
    private String vendorName;
    private String warrantyExpiryDate;
    private String warrantyType;
    private String purchaseDate;
    private String notes;

    public Asset() {}

    public Asset(String id, String companyId, String companyName, String assetTag, String name, String category, String status, String location, String ownerId, String ownerName, Double value, String condition, String serialNumber, String purchaseDate, String notes) {
        this.id = id;
        this.companyId = companyId;
        this.companyName = companyName;
        this.assetTag = assetTag;
        this.name = name;
        this.category = category;
        this.status = status;
        this.location = location;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.value = value;
        this.condition = condition;
        this.serialNumber = serialNumber;
        this.purchaseDate = purchaseDate;
        this.notes = notes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getMacAddress() { return macAddress; }
    public void setMacAddress(String macAddress) { this.macAddress = macAddress; }

    public String getImei() { return imei; }
    public void setImei(String imei) { this.imei = imei; }

    public String getVendorId() { return vendorId; }
    public void setVendorId(String vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getWarrantyExpiryDate() { return warrantyExpiryDate; }
    public void setWarrantyExpiryDate(String warrantyExpiryDate) { this.warrantyExpiryDate = warrantyExpiryDate; }

    public String getWarrantyType() { return warrantyType; }
    public void setWarrantyType(String warrantyType) { this.warrantyType = warrantyType; }

    public String getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(String purchaseDate) { this.purchaseDate = purchaseDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
