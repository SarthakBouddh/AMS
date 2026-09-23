package com.quantwork.ams.controller;

import com.quantwork.ams.model.Asset;
import com.quantwork.ams.model.Employee;
import com.quantwork.ams.service.ActivityLogService;
import com.quantwork.ams.service.AssetAuditLogService;
import com.quantwork.ams.service.AssetService;
import com.quantwork.ams.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private AssetAuditLogService assetAuditLogService;

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String assetName,
            @RequestParam(required = false) String ownerName,
            @RequestParam(required = false) String vendorId) {
        return ResponseEntity.ok(assetService.getAllAssets(search, status, category, companyId, assetName, ownerName, vendorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable String id) {
        return assetService.getAssetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Asset> createAsset(
            @RequestBody Asset asset,
            @RequestParam(defaultValue = "Mara Singh") String currentUser,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String userId) {
        
        if (companyId != null && !companyId.trim().isEmpty()) {
            asset.setCompanyId(companyId);
        }
        Asset created = assetService.saveAsset(asset);
        activityLogService.logActivity(
                "Operations asset added to inventory: " + created.getName(),
                created.getAssetTag(),
                currentUser,
                "ADD",
                created.getCompanyId()
        );
        assetAuditLogService.recordAssetEvent(
                created.getId(),
                created.getCompanyId(),
                created.getAssetTag(),
                "ASSET_CREATED",
                "Asset created: " + created.getName() + " (" + created.getAssetTag() + ")",
                currentUser,
                userId
        );
        return ResponseEntity.ok(created);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Asset>> bulkCreateAssets(
            @RequestBody List<Asset> assets,
            @RequestParam(defaultValue = "Mara Singh") String currentUser,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String userId) {

        List<Asset> createdList = new java.util.ArrayList<>();
        for (Asset asset : assets) {
            if (companyId != null && !companyId.trim().isEmpty()) {
                asset.setCompanyId(companyId);
            }
            Asset created = assetService.saveAsset(asset);
            createdList.add(created);
            assetAuditLogService.recordAssetEvent(
                    created.getId(),
                    created.getCompanyId(),
                    created.getAssetTag(),
                    "ASSET_BULK_CREATED",
                    "Bulk imported asset: " + created.getName() + " (" + created.getAssetTag() + ")",
                    currentUser,
                    userId
            );
        }
        activityLogService.logActivity(
                "Bulk uploaded " + createdList.size() + " assets to inventory",
                "BULK_IMPORT",
                currentUser,
                "BULK_ADD",
                companyId
        );
        return ResponseEntity.ok(createdList);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(
            @PathVariable String id,
            @RequestBody Asset assetDetails,
            @RequestParam(defaultValue = "Mara Singh") String currentUser,
            @RequestParam(required = false) String userId) {
        
        Optional<Asset> existingOpt = assetService.getAssetById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Asset existing = existingOpt.get();
        existing.setName(assetDetails.getName());
        existing.setCategory(assetDetails.getCategory());
        existing.setStatus(assetDetails.getStatus());
        existing.setLocation(assetDetails.getLocation());
        existing.setValue(assetDetails.getValue());
        existing.setCondition(assetDetails.getCondition());
        existing.setSerialNumber(assetDetails.getSerialNumber());
        existing.setPurchaseDate(assetDetails.getPurchaseDate());
        existing.setNotes(assetDetails.getNotes());
        existing.setVendorId(assetDetails.getVendorId());
        existing.setVendorName(assetDetails.getVendorName());
        
        if (assetDetails.getCompanyId() != null) {
            existing.setCompanyId(assetDetails.getCompanyId());
            existing.setCompanyName(assetDetails.getCompanyName());
        }

        if (assetDetails.getOwnerId() != null) {
            existing.setOwnerId(assetDetails.getOwnerId());
            existing.setOwnerName(assetDetails.getOwnerName());
        }

        Asset updated = assetService.saveAsset(existing);
        activityLogService.logActivity(
                "Updated details for asset " + updated.getName(),
                updated.getAssetTag(),
                currentUser,
                "UPDATE",
                updated.getCompanyId()
        );
        assetAuditLogService.recordAssetEvent(
                updated.getId(),
                updated.getCompanyId(),
                updated.getAssetTag(),
                "ASSET_UPDATED",
                "Asset details updated: " + updated.getName() + " (status: " + updated.getStatus() + ")",
                currentUser,
                userId
        );
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Asset> assignAsset(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @RequestParam(defaultValue = "Mara Singh") String currentUser,
            @RequestParam(required = false) String userId) {
        
        Optional<Asset> existingOpt = assetService.getAssetById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Asset asset = existingOpt.get();
        String employeeId = payload.get("employeeId");

        if (employeeId == null || employeeId.trim().isEmpty() || "unassigned".equalsIgnoreCase(employeeId)) {
            asset.setOwnerId(null);
            asset.setOwnerName("Unassigned");
            asset.setStatus("Available");
            Asset updated = assetService.saveAsset(asset);
            activityLogService.logActivity(
                    asset.getName() + " returned and marked Available",
                    asset.getAssetTag(),
                    currentUser,
                    "UNASSIGN",
                    asset.getCompanyId()
            );
            assetAuditLogService.recordAssetEvent(
                    updated.getId(),
                    updated.getCompanyId(),
                    updated.getAssetTag(),
                    "ASSET_UNASSIGNED",
                    "Asset returned to inventory and marked Available",
                    currentUser,
                    userId
            );
            return ResponseEntity.ok(updated);
        } else {
            Optional<Employee> empOpt = employeeService.getEmployeeById(employeeId);
            if (empOpt.isPresent()) {
                Employee emp = empOpt.get();
                asset.setOwnerId(emp.getId());
                asset.setOwnerName(emp.getName());
                asset.setStatus("Assigned");
                Asset updated = assetService.saveAsset(asset);
                activityLogService.logActivity(
                        asset.getName() + " assigned to " + emp.getName(),
                        asset.getAssetTag(),
                        currentUser,
                        "ASSIGN",
                        asset.getCompanyId()
                );
                assetAuditLogService.recordAssetEvent(
                        updated.getId(),
                        updated.getCompanyId(),
                        updated.getAssetTag(),
                        "ASSET_ASSIGNED",
                        "Asset assigned to " + emp.getName(),
                        currentUser,
                        userId
                );
                return ResponseEntity.ok(updated);
            } else {
                return ResponseEntity.badRequest().build();
            }
        }
    }

    @PutMapping("/{id}/collect")
    public ResponseEntity<Asset> collectAsset(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> payload,
            @RequestParam(defaultValue = "Mara Singh") String currentUser,
            @RequestParam(required = false) String userId) {
        
        Optional<Asset> existingOpt = assetService.getAssetById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Asset asset = existingOpt.get();
        String previousOwner = asset.getOwnerName() != null ? asset.getOwnerName() : "Employee";
        String notes = payload != null ? payload.get("notes") : null;
        String condition = payload != null ? payload.get("condition") : null;

        asset.setOwnerId(null);
        asset.setOwnerName("Unassigned");
        asset.setStatus("Available");
        if (condition != null && !condition.trim().isEmpty()) {
            asset.setCondition(condition);
        }
        if (notes != null && !notes.trim().isEmpty()) {
            asset.setNotes(notes);
        }

        Asset updated = assetService.saveAsset(asset);

        String noteSuffix = (notes != null && !notes.trim().isEmpty()) ? " [Notes: " + notes.trim() + "]" : "";
        activityLogService.logActivity(
                "Collected asset " + asset.getName() + " (" + asset.getAssetTag() + ") back from " + previousOwner + noteSuffix,
                asset.getAssetTag(),
                currentUser,
                "COLLECT",
                asset.getCompanyId()
        );

        assetAuditLogService.recordAssetEvent(
                updated.getId(),
                updated.getCompanyId(),
                updated.getAssetTag(),
                "ASSET_COLLECTED",
                "Asset collected back from " + previousOwner + noteSuffix,
                currentUser,
                userId
        );

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(
            @PathVariable String id,
            @RequestParam(defaultValue = "Mara Singh") String currentUser,
            @RequestParam(required = false) String userId) {
        Optional<Asset> existingOpt = assetService.getAssetById(id);
        if (existingOpt.isPresent()) {
            Asset asset = existingOpt.get();
            activityLogService.logActivity(
                    "Removed asset " + asset.getName() + " from system",
                    asset.getAssetTag(),
                    currentUser,
                    "DELETE",
                    asset.getCompanyId()
            );
            assetAuditLogService.recordAssetEvent(
                    asset.getId(),
                    asset.getCompanyId(),
                    asset.getAssetTag(),
                    "ASSET_DELETED",
                    "Asset deleted from inventory: " + asset.getName(),
                    currentUser,
                    userId
            );
        }
        boolean deleted = assetService.deleteAsset(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
