package com.quantwork.ams.controller;

import com.quantwork.ams.model.Company;
import com.quantwork.ams.model.User;
import com.quantwork.ams.service.CompanyService;
import com.quantwork.ams.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(companyService.getAllCompanies(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable String id) {
        return companyService.getCompanyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Company> createCompany(@RequestBody Company company) {
        Company created = companyService.saveCompany(company);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable String id, @RequestBody Company company) {
        Company updated = companyService.updateCompany(id, company);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable String id) {
        boolean deleted = companyService.deleteCompany(id);
        if (deleted) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }

    // Company Credentials Management for Super Admin
    @GetMapping("/{companyId}/users")
    public ResponseEntity<List<User>> getCompanyUsers(@PathVariable String companyId) {
        return ResponseEntity.ok(userService.getUsersByCompany(companyId));
    }

    @PostMapping("/{companyId}/users")
    public ResponseEntity<User> createCompanyCredential(@PathVariable String companyId, @RequestBody User newUser) {
        Company company = companyService.getCompanyById(companyId).orElse(null);
        if (company != null) {
            newUser.setCompanyId(company.getId());
            newUser.setCompanyName(company.getName());
        } else {
            newUser.setCompanyId(companyId);
        }
        User created = userService.createUser(newUser);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{companyId}/users/{userId}")
    public ResponseEntity<User> updateCompanyCredential(@PathVariable String companyId, @PathVariable String userId, @RequestBody User userDetails) {
        User updated = userService.updateUser(userId, userDetails);
        if (updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{companyId}/users/{userId}")
    public ResponseEntity<Void> deleteCompanyCredential(@PathVariable String companyId, @PathVariable String userId) {
        boolean deleted = userService.deleteUser(userId);
        if (deleted) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }
}
