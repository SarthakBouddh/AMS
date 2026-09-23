package com.quantwork.ams.controller;

import com.quantwork.ams.model.Asset;
import com.quantwork.ams.model.RequestItem;
import com.quantwork.ams.model.User;
import com.quantwork.ams.service.ActivityLogService;
import com.quantwork.ams.service.AssetAuditLogService;
import com.quantwork.ams.service.AssetService;
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
    private AssetService assetService;

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

        User authUser = resolveUser(userId, currentUserRole, currentUser, false);
        if (authUser == null) {
            authUser = new User();
            authUser.setId(userId != null && !userId.isBlank() ? userId : "usr-" + System.currentTimeMillis());
            authUser.setName(currentUser != null ? currentUser : "Employee");
            authUser.setEmail(currentUser != null && currentUser.contains("@") ? currentUser : "employee@company.com");
            authUser.setRole(currentUserRole != null ? currentUserRole : "Employee");
        }

        if (request.getEmployeeId() != null && !request.getEmployeeId().trim().isEmpty() && !request.getEmployeeId().equals(authUser.getId())) {
            // keep authorized user id
            request.setEmployeeId(authUser.getId());
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
        String roleStr = (authUser.getRole() != null ? authUser.getRole() : "").toLowerCase();
        if (roleStr.contains("admin") || roleStr.contains("director") || roleStr.contains("head")) {
            request.setOriginCategory("ADMIN_DIRECT");
            request.setManagerStatus("APPROVED");
        } else if (roleStr.contains("manager") || roleStr.contains("supervisor")) {
            request.setOriginCategory("MANAGER");
        } else {
            request.setOriginCategory("EMPLOYEE");
        }

        if (request.getManagerStatus() == null) {
            request.setManagerStatus("PENDING");
        }
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

        User authUser = resolveUser(userId, currentUserRole, currentUser, true);
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

        User authUser = resolveUser(userId, currentUserRole, currentUser, true);
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
            @RequestBody(required = false) RequestItem allocationDetails,
            @RequestParam(defaultValue = "Admin") String currentUser,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String currentUserRole) {

        User authUser = resolveUser(userId, currentUserRole, currentUser, true);
        if (authUser == null) {
            return ResponseEntity.status(403).body("Only an admin can allocate requests.");
        }

        Optional<RequestItem> opt = requestService.getRequestById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        RequestItem item = opt.get();
        if (!"APPROVED".equalsIgnoreCase(item.getManagerStatus()) && !"APPROVED".equalsIgnoreCase(item.getStatus()) && !"ADMIN_DIRECT".equalsIgnoreCase(item.getOriginCategory())) {
            return ResponseEntity.status(400).body("Request must be approved by a manager before allocation.");
        }

        if (allocationDetails != null) {
            if (allocationDetails.getSerialNo() != null && !allocationDetails.getSerialNo().isBlank()) item.setSerialNo(allocationDetails.getSerialNo());
            if (allocationDetails.getAssetTag() != null && !allocationDetails.getAssetTag().isBlank()) item.setAssetTag(allocationDetails.getAssetTag());
            if (allocationDetails.getCondition() != null && !allocationDetails.getCondition().isBlank()) item.setCondition(allocationDetails.getCondition());
            if (allocationDetails.getAdminNotes() != null && !allocationDetails.getAdminNotes().isBlank()) item.setAdminNotes(allocationDetails.getAdminNotes());
            if (allocationDetails.getAllocationDate() != null && !allocationDetails.getAllocationDate().isBlank()) item.setAllocationDate(allocationDetails.getAllocationDate());
            if (allocationDetails.getTargetAssetId() != null && !allocationDetails.getTargetAssetId().isBlank()) item.setTargetAssetId(allocationDetails.getTargetAssetId());
            if (allocationDetails.getTargetAssetName() != null && !allocationDetails.getTargetAssetName().isBlank()) item.setTargetAssetName(allocationDetails.getTargetAssetName());
        }

        item.setAdminStatus("ALLOCATED");
        item.setStatus("APPROVED");
        RequestItem saved = requestService.saveRequest(item);

        // Hardware vs Software Inventory Status Synchronization
        boolean isSoftware = "Software".equalsIgnoreCase(saved.getRequestCategory()) || "SOFTWARE_LICENSE".equalsIgnoreCase(saved.getRequestType());
        if (saved.getTargetAssetId() != null && !saved.getTargetAssetId().isBlank()) {
            assetService.getAssetById(saved.getTargetAssetId()).ifPresent(asset -> {
                if (isSoftware) {
                    // Multi-user software license allocation
                    asset.setStatus("AVAILABLE"); // Keep available for other employees
                    if (asset.getAssignedUsers() == null) {
                        asset.setAssignedUsers(new java.util.ArrayList<>());
                    }
                    String assignee = saved.getEmployeeName() != null ? saved.getEmployeeName() : saved.getRequestedBy();
                    if (assignee != null && !asset.getAssignedUsers().contains(assignee)) {
                        asset.getAssignedUsers().add(assignee);
                    }
                    asset.setAssignedCount(asset.getAssignedUsers().size());
                    assetService.saveAsset(asset);
                } else {
                    // Physical / Hardware asset: assign to employee & mark ALLOCATED
                    asset.setStatus("ALLOCATED");
                    asset.setOwnerId(saved.getEmployeeId());
                    asset.setOwnerName(saved.getEmployeeName() != null ? saved.getEmployeeName() : saved.getRequestedBy());
                    if (saved.getSerialNo() != null && !saved.getSerialNo().isBlank()) asset.setSerialNumber(saved.getSerialNo());
                    if (saved.getAssetTag() != null && !saved.getAssetTag().isBlank()) asset.setAssetTag(saved.getAssetTag());
                    if (saved.getCondition() != null && !saved.getCondition().isBlank()) asset.setCondition(saved.getCondition());
                    assetService.saveAsset(asset);
                }
            });
        }

        activityLogService.logActivity(
                "Admin allocated asset (" + (isSoftware ? "Software Multi-License" : "Physical Hardware") + ") for request: " + saved.getTargetAssetName(),
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

    private User resolveUser(String userId, String role, String username, boolean requireManager) {
        User user = null;

        if (userId != null && !userId.trim().isEmpty()) {
            Optional<User> userOpt = userService.getUserById(userId);
            if (userOpt.isPresent()) {
                user = userOpt.get();
            }
        }

        if (user == null && username != null && !username.trim().isEmpty()) {
            List<User> allUsers = userService.getUsersByCompany("ALL");
            user = allUsers.stream()
                    .filter(u -> (u.getEmail() != null && u.getEmail().equalsIgnoreCase(username))
                            || (u.getName() != null && u.getName().equalsIgnoreCase(username)))
                    .findFirst().orElse(null);
        }

        if (user == null) {
            user = new User();
            user.setId(userId != null && !userId.isBlank() ? userId : "usr-" + System.currentTimeMillis());
            user.setName(username != null ? username : "User");
            user.setEmail(username != null && username.contains("@") ? username : "user@company.com");
            user.setRole(role != null ? role : "Employee");
            return user;
        }

        if (requireManager) {
            String storedRole = user.getRole() != null ? user.getRole() : "";
            String requestRole = role != null ? role : "";
            String normalizedStored = normalizeRole(storedRole);
            String normalizedRequest = normalizeRole(requestRole);

            boolean isManager = isAnyMatch(normalizedStored, "manager", "company admin", "admin", "operations lead", "lead", "supervisor", "super")
                    || isAnyMatch(normalizedRequest, "manager", "company admin", "admin", "operations lead", "lead", "supervisor", "super");
            if (!isManager) {
                return null;
            }
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
