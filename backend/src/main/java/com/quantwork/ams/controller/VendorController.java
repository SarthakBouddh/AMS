package com.quantwork.ams.controller;

import com.quantwork.ams.model.Vendor;
import com.quantwork.ams.service.ActivityLogService;
import com.quantwork.ams.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<Vendor>> getAllVendors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String companyId) {
        return ResponseEntity.ok(vendorService.getAllVendors(search, category, companyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable String id) {
        return vendorService.getVendorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Vendor> createVendor(
            @RequestBody Vendor vendor,
            @RequestParam(defaultValue = "Admin") String currentUser,
            @RequestParam(required = false) String companyId) {

        if (companyId != null && !companyId.trim().isEmpty()) {
            vendor.setCompanyId(companyId);
        }
        Vendor saved = vendorService.saveVendor(vendor);
        activityLogService.logActivity(
                "Added new vendor: " + saved.getName(),
                "VENDOR",
                currentUser,
                "CREATE_VENDOR",
                saved.getCompanyId()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vendor> updateVendor(
            @PathVariable String id,
            @RequestBody Vendor vendorDetails,
            @RequestParam(defaultValue = "Admin") String currentUser) {

        Optional<Vendor> existingOpt = vendorService.getVendorById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Vendor existing = existingOpt.get();
        existing.setName(vendorDetails.getName());
        existing.setContactPerson(vendorDetails.getContactPerson());
        existing.setEmail(vendorDetails.getEmail());
        existing.setPhone(vendorDetails.getPhone());
        existing.setAddress(vendorDetails.getAddress());
        existing.setCategory(vendorDetails.getCategory());
        existing.setRating(vendorDetails.getRating());
        existing.setNotes(vendorDetails.getNotes());
        if (vendorDetails.getCompanyId() != null) {
            existing.setCompanyId(vendorDetails.getCompanyId());
        }

        Vendor updated = vendorService.saveVendor(existing);
        activityLogService.logActivity(
                "Updated details for vendor: " + updated.getName(),
                "VENDOR",
                currentUser,
                "UPDATE_VENDOR",
                updated.getCompanyId()
        );
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(
            @PathVariable String id,
            @RequestParam(defaultValue = "Admin") String currentUser) {

        Optional<Vendor> existingOpt = vendorService.getVendorById(id);
        if (existingOpt.isPresent()) {
            Vendor v = existingOpt.get();
            activityLogService.logActivity(
                    "Removed vendor: " + v.getName(),
                    "VENDOR",
                    currentUser,
                    "DELETE_VENDOR",
                    v.getCompanyId()
            );
        }
        boolean deleted = vendorService.deleteVendor(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
