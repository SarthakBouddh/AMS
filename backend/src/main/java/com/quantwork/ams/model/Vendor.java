package com.quantwork.ams.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "vendors")
public class Vendor {

    @Id
    private String id;
    private String companyId;
    private String companyName;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String category; // Hardware Supplier, Maintenance & Repair, Software Provider, Furniture Supplier, General
    private String rating;   // Preferred, Standard, Under Review
    private String notes;
    private String createdAt;

    public Vendor() {}

    public Vendor(String id, String companyId, String companyName, String name, String contactPerson, String email, String phone, String address, String category, String rating, String notes, String createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.companyName = companyName;
        this.name = name;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.category = category;
        this.rating = rating;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getRating() { return rating; }
    public void setRating(String rating) { this.rating = rating; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
