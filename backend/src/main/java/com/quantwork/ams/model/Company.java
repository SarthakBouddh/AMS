package com.quantwork.ams.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "companies")
public class Company {
    @Id
    private String id;
    private String name;               // e.g. Northstar Studio
    private String code;               // e.g. NORTHSTAR
    private String domain;             // e.g. northstar.co
    private String status;             // e.g. Active, Pending, Suspended
    private String subscriptionPlan;   // e.g. Enterprise, Pro, Starter
    private String contactEmail;       // e.g. admin@northstar.co
    private String createdAt;          // e.g. 2024-01-10
}
