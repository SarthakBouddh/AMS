package com.quantwork.ams.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String companyId;    // Multi-tenant check: e.g. comp-northstar or "SYSTEM" for super admin
    private String companyName;  // e.g. Northstar Studio or "Super Admin Portal"
    private String name;
    private String email;
    private String password;
    private String role;         // e.g. SUPER_ADMIN, Operations Lead, Engineering Lead, Manager, Employee
    private String department;   // e.g. System Admin, Operations, Engineering
    private String initials;     // e.g. SA, MS, JB
    private boolean superAdmin;  // true if Super Admin user
    private boolean revoked = false; // true if user credentials have been revoked / deleted
}
