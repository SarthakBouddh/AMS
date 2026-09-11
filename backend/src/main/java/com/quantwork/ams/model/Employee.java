package com.quantwork.ams.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "employees")
public class Employee {
    @Id
    private String id;
    private String companyId;    // Multi-tenant check: e.g. comp-northstar
    private String companyName;  // e.g. Northstar Studio
    private String name;         // e.g. Jon Bell
    private String email;        // e.g. jon.bell@northstar.co
    private String department;   // e.g. Engineering, Design, Operations
    private String role;         // e.g. Senior Developer
    private String status;       // e.g. Available for assignment, Assigned 2 assets
    private String initials;     // e.g. JB
    private String location;     // e.g. Mumbai office
    private String avatarBg;     // e.g. bg-amber-100 text-amber-800
}
