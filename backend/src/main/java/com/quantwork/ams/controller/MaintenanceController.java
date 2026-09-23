package com.quantwork.ams.controller;

import com.quantwork.ams.model.Asset;
import com.quantwork.ams.model.MaintenanceTicket;
import com.quantwork.ams.model.Vendor;
import com.quantwork.ams.service.VendorService;
import com.quantwork.ams.service.ActivityLogService;
import com.quantwork.ams.service.AssetAuditLogService;
import com.quantwork.ams.service.AssetService;
import com.quantwork.ams.service.MaintenanceTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @Autowired
    private MaintenanceTicketService ticketService;

    @Autowired
    private AssetService assetService;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private AssetAuditLogService assetAuditLogService;

    @GetMapping
    public ResponseEntity<List<MaintenanceTicket>> getTickets(
            @RequestParam(required = false) String maintenanceType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String companyId) {
        return ResponseEntity.ok(ticketService.getTickets(maintenanceType, status, search, companyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceTicket> getTicketById(@PathVariable String id) {
        return ticketService.getTicketById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MaintenanceTicket> createTicket(
            @RequestBody MaintenanceTicket ticket,
            @RequestParam(defaultValue = "Admin") String currentUser,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String userId) {

        if (companyId != null && !companyId.trim().isEmpty()) {
            ticket.setCompanyId(companyId);
        }
        if (ticket.getStatus() == null || ticket.getStatus().trim().isEmpty()) {
            ticket.setStatus("OPEN");
        }

        // Auto-fill vendor contact details if linked asset or vendor exists
        if (ticket.getAssetId() != null && !ticket.getAssetId().trim().isEmpty()) {
            Optional<Asset> assetOpt = assetService.getAssetById(ticket.getAssetId());
            if (assetOpt.isPresent()) {
                Asset asset = assetOpt.get();
                if (asset.getVendorId() != null && !asset.getVendorId().trim().isEmpty()) {
                    Optional<Vendor> vOpt = vendorService.getVendorById(asset.getVendorId());
                    if (vOpt.isPresent()) {
                        Vendor v = vOpt.get();
                        if (ticket.getVendorId() == null) ticket.setVendorId(v.getId());
                        if (ticket.getVendorName() == null) ticket.setVendorName(v.getName());
                        if (ticket.getVendorPhone() == null) ticket.setVendorPhone(v.getPhone());
                        if (ticket.getVendorContactPerson() == null) ticket.setVendorContactPerson(v.getContactPerson());
                        if (ticket.getVendorEmail() == null) ticket.setVendorEmail(v.getEmail());
                        if (ticket.getVendorAddress() == null) ticket.setVendorAddress(v.getAddress());
                    }
                } else if (asset.getVendorName() != null && !asset.getVendorName().trim().isEmpty()) {
                    if (ticket.getVendorName() == null) ticket.setVendorName(asset.getVendorName());
                }
            }
        }

        if (ticket.getVendorId() != null && !ticket.getVendorId().trim().isEmpty() && (ticket.getVendorPhone() == null || ticket.getVendorPhone().trim().isEmpty())) {
            Optional<Vendor> vOpt = vendorService.getVendorById(ticket.getVendorId());
            if (vOpt.isPresent()) {
                Vendor v = vOpt.get();
                ticket.setVendorName(v.getName());
                ticket.setVendorPhone(v.getPhone());
                ticket.setVendorContactPerson(v.getContactPerson());
                ticket.setVendorEmail(v.getEmail());
                ticket.setVendorAddress(v.getAddress());
            }
        }

        MaintenanceTicket saved = ticketService.saveTicket(ticket);

        // Update asset status to Maintenance if linked asset exists
        if (saved.getAssetId() != null) {
            Optional<Asset> assetOpt = assetService.getAssetById(saved.getAssetId());
            if (assetOpt.isPresent()) {
                Asset asset = assetOpt.get();
                if ("REPLACE".equalsIgnoreCase(saved.getMaintenanceType())) {
                    asset.setStatus("Maintenance");
                } else {
                    asset.setStatus("Maintenance");
                }
                assetService.saveAsset(asset);
            }
        }

        String actionText = "REPLACE".equalsIgnoreCase(saved.getMaintenanceType()) ? "Logged replacement ticket" : "Logged repair ticket";
        activityLogService.logActivity(
                actionText + " for asset " + saved.getAssetName() + " (Issue: " + (saved.getIssueKeyword() != null ? saved.getIssueKeyword() : saved.getProblemDescription()) + ")",
                saved.getAssetTag() != null ? saved.getAssetTag() : "MAINTENANCE",
                currentUser,
                "MAINTENANCE_TICKET",
                saved.getCompanyId()
        );

        if (saved.getAssetId() != null) {
            assetAuditLogService.recordAssetEvent(
                    saved.getAssetId(),
                    saved.getCompanyId(),
                    saved.getAssetTag() != null ? saved.getAssetTag() : "MAINTENANCE",
                    "MAINTENANCE_OPENED",
                    "Maintenance ticket created for asset " + saved.getAssetName() + ": " + (saved.getIssueKeyword() != null ? saved.getIssueKeyword() : saved.getProblemDescription()),
                    currentUser,
                    userId
            );
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceTicket> updateTicket(
            @PathVariable String id,
            @RequestBody MaintenanceTicket details,
            @RequestParam(defaultValue = "Admin") String currentUser,
            @RequestParam(required = false) String userId) {

        Optional<MaintenanceTicket> existingOpt = ticketService.getTicketById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MaintenanceTicket existing = existingOpt.get();
        existing.setMaintenanceType(details.getMaintenanceType());
        existing.setIssueKeyword(details.getIssueKeyword());
        existing.setVendorId(details.getVendorId());
        existing.setVendorName(details.getVendorName());
        existing.setProblemDescription(details.getProblemDescription());
        existing.setPriority(details.getPriority());
        existing.setStatus(details.getStatus());
        existing.setTechnicianAssigned(details.getTechnicianAssigned());
        existing.setRepairCost(details.getRepairCost());
        existing.setResolutionNotes(details.getResolutionNotes());

        MaintenanceTicket updated = ticketService.saveTicket(existing);

        activityLogService.logActivity(
                "Updated maintenance ticket for " + updated.getAssetName() + " [Status: " + updated.getStatus() + "]",
                updated.getAssetTag() != null ? updated.getAssetTag() : "MAINTENANCE",
                currentUser,
                "UPDATE_MAINTENANCE",
                updated.getCompanyId()
        );

        if (updated.getAssetId() != null) {
            assetAuditLogService.recordAssetEvent(
                    updated.getAssetId(),
                    updated.getCompanyId(),
                    updated.getAssetTag() != null ? updated.getAssetTag() : "MAINTENANCE",
                    "MAINTENANCE_UPDATED",
                    "Maintenance ticket updated for asset " + updated.getAssetName() + " [Status: " + updated.getStatus() + "]",
                    currentUser,
                    userId
            );
        }

        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<MaintenanceTicket> resolveTicket(
            @PathVariable String id,
            @RequestBody(required = false) MaintenanceTicket details,
            @RequestParam(defaultValue = "Admin") String currentUser,
            @RequestParam(required = false) String userId) {

        Optional<MaintenanceTicket> existingOpt = ticketService.getTicketById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MaintenanceTicket existing = existingOpt.get();
        if ("REPLACE".equalsIgnoreCase(existing.getMaintenanceType())) {
            existing.setStatus("REPLACED");
        } else {
            existing.setStatus("RESOLVED");
        }
        existing.setResolvedAt(LocalDate.now().toString());

        if (details != null) {
            if (details.getRepairCost() != null) existing.setRepairCost(details.getRepairCost());
            if (details.getResolutionNotes() != null) existing.setResolutionNotes(details.getResolutionNotes());
        }

        MaintenanceTicket updated = ticketService.saveTicket(existing);

        // Restore asset status to Available or Retired
        if (updated.getAssetId() != null) {
            Optional<Asset> assetOpt = assetService.getAssetById(updated.getAssetId());
            if (assetOpt.isPresent()) {
                Asset asset = assetOpt.get();
                if ("REPLACED".equalsIgnoreCase(updated.getStatus())) {
                    asset.setStatus("Retired");
                } else {
                    asset.setStatus("Available");
                }
                assetService.saveAsset(asset);
            }
        }

        activityLogService.logActivity(
                "Resolved maintenance ticket for " + updated.getAssetName() + " (" + updated.getStatus() + ")",
                updated.getAssetTag() != null ? updated.getAssetTag() : "MAINTENANCE",
                currentUser,
                "RESOLVE_MAINTENANCE",
                updated.getCompanyId()
        );

        if (updated.getAssetId() != null) {
            assetAuditLogService.recordAssetEvent(
                    updated.getAssetId(),
                    updated.getCompanyId(),
                    updated.getAssetTag() != null ? updated.getAssetTag() : "MAINTENANCE",
                    "MAINTENANCE_RESOLVED",
                    "Maintenance completed for asset " + updated.getAssetName() + " with status " + updated.getStatus(),
                    currentUser,
                    userId
            );
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable String id,
            @RequestParam(defaultValue = "Admin") String currentUser) {

        Optional<MaintenanceTicket> existingOpt = ticketService.getTicketById(id);
        if (existingOpt.isPresent()) {
            MaintenanceTicket ticket = existingOpt.get();
            activityLogService.logActivity(
                    "Deleted maintenance ticket for " + ticket.getAssetName(),
                    ticket.getAssetTag() != null ? ticket.getAssetTag() : "MAINTENANCE",
                    currentUser,
                    "DELETE_MAINTENANCE",
                    ticket.getCompanyId()
            );
        }

        boolean deleted = ticketService.deleteTicket(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
