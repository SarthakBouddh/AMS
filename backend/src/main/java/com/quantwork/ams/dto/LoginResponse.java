package com.quantwork.ams.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private String id;
    private String companyId;
    private String companyName;
    private String name;
    private String email;
    private String role;
    private String department;
    private String initials;
    private boolean superAdmin;
}
