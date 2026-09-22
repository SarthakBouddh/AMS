package com.quantwork.ams.controller;

import com.quantwork.ams.model.RequestItem;
import com.quantwork.ams.model.User;
import com.quantwork.ams.service.ActivityLogService;
import com.quantwork.ams.service.AssetAuditLogService;
import com.quantwork.ams.service.RequestItemService;
import com.quantwork.ams.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    @Autowired
    private RequestItemService requestService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private AssetAuditLogService assetAuditLogService;

    @GetMapping
    public ResponseEntity<List<RequestItem>> getRequests(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role) {
        List<RequestItem> allRequests = requestService.getRequests(type, companyId);
        if (userId != null && !userId.trim().isEmpty()) {
            List<RequestItem> filtered = allRequests.stream()
                    .filter(r -> r.getEmployeeId() != null && r.getEmployeeId().equals(userId))
                    .toList();
            if (filtered.size() > 0 || isEmployeeRole(role)) {
                return ResponseEntity.ok(filtered);
            }
        }
        return ResponseEntity.ok(allRequests);
    }

    @PostMapping
    public ResponseEntity<?> createRequest(
            @RequestBody RequestItem request,
            @RequestParam(defaultValue = "Employee") String currentUser,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String currentUserRole) {

        User authUser = resolveUser(userId, currentUserRole, false);
        if (authUser == null) {
            return ResponseEntity.status(403).body("Only an employee can submit asset requests.");
        }

        if (request.getEmployeeId() != null && !request.getEmployeeId().trim().isEmpty() && !request.getEmployeeId().equals(authUser.getId())) {
            return ResponseEntity.status(403).body("You cannot submit a request for another employee.");
        }

        request.setEmployeeId(authUser.getId());
        request.setEmployeeName(authUser.getName());
        request.setRequestedBy(authUser.getEmail());
        request.setDepartment(authUser.getDepartment() != null ? authUser.getDepartment() : "Operations");
        if (companyId != null && !companyId.trim().isEmpty()) {
            request.setCompanyId(companyId);
        } else {
            request.setCompanyId(authUser.getCompanyId());
        }
        request.setManagerStatus("PENDING");
        request.setAdminStatus("PENDING");
        request.setStatus("PENDING");
        request.setReasonNotes(request.getReasonNotes() != null ? request.getReasonNotes() : request.getJustification());

        RequestItem saved = requestService.saveRequest(request);

        activityLogService.logActivity(
                "Submitted request for " + saved.getTargetAssetName() + " (" + saved.getRequestType() + ")",
                saved.getTargetAssetId() != null ? saved.getTargetAssetId() : "REQUEST",
                currentUser,
                "CREATE_REQUEST",
                saved.getCompanyId()
        );

        if (saved.getTargetAssetId() != null && !saved.getTargetAssetId().trim().isEmpty()) {
            assetAuditLogService.recordAssetEvent(
                    saved.getTargetAssetId(),
                    saved.getCompanyId(),
                    saved.getTargetAssetName() != null ? saved.getTargetAssetName() : "REQUEST",
                    "REQUEST_CREATED",
                    "Employee request created for asset " + saved.getTargetAssetName(),
                    currentUser,
                    authUser.getId()
            );
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/approve-manager")
    public ResponseEntity<?> approveManager(
            @PathVariable String id,
            @RequestParam(defaultValue = "Manager") String currentUser,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String currentUserRole,
            @RequestParam(required = false) String managerComment) {

        User authUser = resolveUser(userId, currentUserRole, true);
        if (authUser == null) {
            return ResponseEntity.status(403).body("Only a manager can approve employee requests.");
        }

        Optional<RequestItem> opt = requestService.getRequestById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        RequestItem item = opt.get();
        if (!"PENDING".equalsIgnoreCase(item.getManagerStatus())) {
            return ResponseEntity.status(400).body("Only pending requests can be approved.");
        }

        item.setManagerId(authUser.getId());
        item.setManagerName(authUser.getName());
        item.setManagerEmail(authUser.getEmail());
        item.setManagerStatus("APPROVED");
        item.setStatus("APPROVED");
        item.setApprovedByUserId(authUser.getId());
        item.setApprovedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        item.setManagerComment(managerComment != null ? managerComment : "Approved by manager");
        item.setUpdatedAt(item.getApprovedAt());
        RequestItem saved = requestService.saveRequest(item);

        activityLogService.logActivity(
                "Manager approved request for " + saved.getTargetAssetName(),
                saved.getTargetAssetId() != null ? saved.getTargetAssetId() : "REQUEST",
                currentUser,
                "APPROVE_REQUEST",
                saved.getCompanyId()
        );

        if (saved.getTargetAssetId() != null && !saved.getTargetAssetId().trim().isEmpty()) {
            assetAuditLogService.recordAssetEvent(
                    saved.getTargetAssetId(),
                    saved.getCompanyId(),
                    saved.getTargetAssetName() != null ? saved.getTargetAssetName() : "REQUEST",
                    "REQUEST_APPROVED",
                    "Manager approved request for asset " + saved.getTargetAssetName(),
                    currentUser,
                    authUser.getId()
            );
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/reject-manager")
    public ResponseEntity<?> rejectManager(
            @PathVariable String id,
            @RequestParam(defaultValue = "Manager") String currentUser,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String currentUserRole,
            @RequestParam(required = false) String managerComment) {

        User authUser = resolveUser(userId, currentUserRole, true);
        if (authUser == null) {
            return ResponseEntity.status(403).body("Only a manager can reject employee requests.");
        }

        Optional<RequestItem> opt = requestService.getRequestById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        RequestItem item = opt.get();
        if (!"PENDING".equalsIgnoreCase(item.getManagerStatus())) {
            return ResponseEntity.status(400).body("Only pending requests can be rejected.");
        }

        item.setManagerId(authUser.getId());
        item.setManagerName(authUser.getName());
        item.setManagerEmail(authUser.getEmail());
        item.setManagerStatus("REJECTED");
        item.setStatus("REJECTED");
        item.setRejectedByUserId(authUser.getId());
        item.setRejectedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        item.setManagerComment(managerComment != null ? managerComment : "Request rejected by manager");
        item.setUpdatedAt(item.getRejectedAt());
        RequestItem saved = requestService.saveRequest(item);

        activityLogService.logActivity(
                "Manager rejected request for " + saved.getTargetAssetName(),
                saved.getTargetAssetId() != null ? saved.getTargetAssetId() : "REQUEST",
                currentUser,
                "REJECT_REQUEST",
                saved.getCompanyId()
        );

        if (saved.getTargetAssetId() != null && !saved.getTargetAssetId().trim().isEmpty()) {
            assetAuditLogService.recordAssetEvent(
                    saved.getTargetAssetId(),
                    saved.getCompanyId(),
                    saved.getTargetAssetName() != null ? saved.getTargetAssetName() : "REQUEST",
                    "REQUEST_REJECTED",
                    "Manager rejected request for asset " + saved.getTargetAssetName(),
                    currentUser,
                    authUser.getId()
            );
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/allocate-admin")
    public ResponseEntity<?> allocateAdmin(
            @PathVariable String id,
            @RequestParam(defaultValue = "Admin") String currentUser,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String currentUserRole) {

        User authUser = resolveUser(userId, currentUserRole, true);
        if (authUser == null) {
            return ResponseEntity.status(403).body("Only an admin can allocate requests.");
        }

        Optional<RequestItem> opt = requestService.getRequestById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        RequestItem item = opt.get();
        if (!"APPROVED".equalsIgnoreCase(item.getManagerStatus()) && !"APPROVED".equalsIgnoreCase(item.getStatus())) {
            return ResponseEntity.status(400).body("Request must be approved by a manager before allocation.");
        }

        item.setAdminStatus("ALLOCATED");
        item.setStatus("APPROVED");
        RequestItem saved = requestService.saveRequest(item);

        activityLogService.logActivity(
                "Admin allocated asset for request: " + saved.getTargetAssetName(),
                saved.getTargetAssetId() != null ? saved.getTargetAssetId() : "REQUEST",
                currentUser,
                "ALLOCATE_ASSET",
                saved.getCompanyId()
        );
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable String id) {
        boolean deleted = requestService.deleteRequest(id);
        if (deleted) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }

    private User resolveUser(String userId, String role, boolean requireManager) {
        if (userId == null || userId.trim().isEmpty()) {
            return null;
        }

        Optional<User> userOpt = userService.getUserById(userId);
        if (userOpt.isEmpty()) {
            return null;
        }

        User user = userOpt.get();
        String storedRole = user.getRole() != null ? user.getRole() : "";
        String requestRole = role != null ? role : "";
        String normalizedStored = normalizeRole(storedRole);
        String normalizedRequest = normalizeRole(requestRole);

        boolean isSuperAdmin = isAnyMatch(normalizedStored, "super_admin", "super admin", "superadmin")
                || isAnyMatch(normalizedRequest, "super_admin", "super admin", "superadmin");
        boolean isManager = isSuperAdmin
                || isAnyMatch(normalizedStored, "manager", "company admin", "admin", "operations lead", "lead", "supervisor")
                || isAnyMatch(normalizedRequest, "manager", "company admin", "admin", "operations lead", "lead", "supervisor");
        boolean isEmployee = isSuperAdmin
                || isAnyMatch(normalizedStored, "employee", "engineer", "developer", "operations", "engineering", "support")
                || isAnyMatch(normalizedRequest, "employee", "engineer", "developer", "operations", "engineering", "support");

        if (requireManager && !isManager) {
            return null;
        }
        if (!requireManager && !isEmployee) {
            return null;
        }
        return user;
    }

    private boolean isEmployeeRole(String role) {
        if (role == null) return false;
        String normalized = normalizeRole(role);
        return isAnyMatch(normalized, "employee", "engineer", "developer", "operations", "engineering", "support");
    }

    private String normalizeRole(String rawRole) {
        if (rawRole == null) return "";
        return rawRole.toLowerCase().replace("_", " ").trim();
    }

    private boolean isAnyMatch(String text, String... values) {
        if (text == null || text.isBlank()) return false;
        for (String value : values) {
            if (text.contains(value)) {
                return true;
            }
        }
        return false;
    }
}
