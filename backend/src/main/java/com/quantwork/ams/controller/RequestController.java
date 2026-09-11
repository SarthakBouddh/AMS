package com.quantwork.ams.controller;

import com.quantwork.ams.model.RequestItem;
import com.quantwork.ams.service.ActivityLogService;
import com.quantwork.ams.service.RequestItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    @Autowired
    private RequestItemService requestService;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<RequestItem>> getRequests(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String companyId) {
        return ResponseEntity.ok(requestService.getRequests(type, companyId));
    }

    @PostMapping
    public ResponseEntity<RequestItem> createRequest(
            @RequestBody RequestItem request,
            @RequestParam(defaultValue = "Employee") String currentUser,
            @RequestParam(required = false) String companyId) {

        if (companyId != null && !companyId.trim().isEmpty()) {
            request.setCompanyId(companyId);
        }
        RequestItem saved = requestService.saveRequest(request);
        activityLogService.logActivity(
                "Submitted request for " + saved.getTargetAssetName() + " (" + saved.getRequestType() + ")",
                "REQUEST",
                currentUser,
                "CREATE_REQUEST",
                saved.getCompanyId()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/approve-manager")
    public ResponseEntity<RequestItem> approveManager(
            @PathVariable String id,
            @RequestParam(defaultValue = "Manager") String currentUser) {

        Optional<RequestItem> opt = requestService.getRequestById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        RequestItem item = opt.get();
        item.setManagerStatus("APPROVED");
        RequestItem saved = requestService.saveRequest(item);

        activityLogService.logActivity(
                "Manager approved request for " + saved.getTargetAssetName(),
                "REQUEST",
                currentUser,
                "APPROVE_REQUEST",
                saved.getCompanyId()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/allocate-admin")
    public ResponseEntity<RequestItem> allocateAdmin(
            @PathVariable String id,
            @RequestParam(defaultValue = "Admin") String currentUser) {

        Optional<RequestItem> opt = requestService.getRequestById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        RequestItem item = opt.get();
        item.setAdminStatus("ALLOCATED");
        RequestItem saved = requestService.saveRequest(item);

        activityLogService.logActivity(
                "Admin allocated asset for request: " + saved.getTargetAssetName(),
                "REQUEST",
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
}
