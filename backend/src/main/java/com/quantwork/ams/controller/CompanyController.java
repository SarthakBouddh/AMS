package com.quantwork.ams.controller;

import com.quantwork.ams.model.Company;
import com.quantwork.ams.model.User;
import com.quantwork.ams.service.ActivityLogService;
import com.quantwork.ams.service.CompanyService;
import com.quantwork.ams.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

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
        
        // Disallow creating Admin credentials directly through this endpoint if specified
        if ("Admin".equalsIgnoreCase(newUser.getRole()) || "SUPER_ADMIN".equalsIgnoreCase(newUser.getRole())) {
            newUser.setRole("Manager");
        }

        if (newUser.getPassword() == null || newUser.getPassword().isBlank()) {
            String defaultPass = (newUser.getName() != null ? newUser.getName().replaceAll("\\s+", "").toLowerCase() : "user") + "123";
            newUser.setPassword(defaultPass);
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

    @PostMapping("/{companyId}/users/{userId}/reset-password")
    public ResponseEntity<User> resetCompanyUserPassword(@PathVariable String companyId, @PathVariable String userId, @RequestParam(required = false) String newPassword) {
        User user = userService.getUserById(userId).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();

        String passToUse = (newPassword != null && !newPassword.isBlank()) 
                ? newPassword 
                : (user.getName() != null ? user.getName().replaceAll("\\s+", "").toLowerCase() : "user") + "123";

        user.setPassword(passToUse);
        User updated = userService.updateUser(userId, user);
        return ResponseEntity.ok(updated);
    }

    @Autowired
    private com.quantwork.ams.repository.AssetRepository assetRepository;

    @Autowired
    private com.quantwork.ams.service.AssetAuditLogService assetAuditLogService;

    @PutMapping("/{companyId}/users/{userId}/restore")
    public ResponseEntity<User> restoreCompanyUser(@PathVariable String companyId, @PathVariable String userId) {
        boolean restored = userService.restoreUser(userId);
        if (restored) {
            Optional<User> userOpt = userService.getUserById(userId);
            if (userOpt.isPresent()) {
                User u = userOpt.get();
                activityLogService.logActivity(
                        "Restored credentials and access for user: " + u.getEmail(),
                        "SUPER_ADMIN",
                        "Super Admin",
                        "RESTORE_USER_CREDENTIAL",
                        companyId
                );
                return ResponseEntity.ok(u);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{companyId}/users/{userId}")
    public ResponseEntity<Void> deleteCompanyCredential(@PathVariable String companyId, @PathVariable String userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Auto-unassign any assets assigned to this user
            List<Asset> assignedAssets = assetRepository.findByOwnerId(userId);
            for (Asset asset : assignedAssets) {
                asset.setOwnerId(null);
                asset.setOwnerName("Unassigned");
                asset.setStatus("Available");
                assetRepository.save(asset);
                activityLogService.logActivity(
                        "Auto-collected asset " + asset.getName() + " back to inventory due to credential revocation for " + user.getEmail(),
                        asset.getAssetTag(),
                        "Super Admin",
                        "UNASSIGN",
                        asset.getCompanyId()
                );
                assetAuditLogService.recordAssetEvent(
                        asset.getId(),
                        asset.getCompanyId(),
                        asset.getAssetTag(),
                        "ASSET_UNASSIGNED",
                        "Asset collected automatically because assigned user credential (" + user.getEmail() + ") was revoked",
                        "Super Admin",
                        null
                );
            }

            userService.revokeUser(userId);
            activityLogService.logActivity(
                    "Revoked access and credential for user: " + user.getEmail(),
                    "SUPER_ADMIN",
                    "Super Admin",
                    "DELETE_USER_CREDENTIAL",
                    companyId
            );
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{companyId}/users/{userId}/permanent")
    public ResponseEntity<Void> permanentDeleteCompanyCredential(@PathVariable String companyId, @PathVariable String userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        String userEmail = userOpt.map(User::getEmail).orElse(userId);
        boolean deleted = userService.permanentDeleteUser(userId);
        if (deleted) {
            activityLogService.logActivity(
                    "Permanently deleted credential record for user: " + userEmail,
                    "SUPER_ADMIN",
                    "Super Admin",
                    "PERMANENT_DELETE_USER",
                    companyId
            );
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
