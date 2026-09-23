package com.quantwork.ams.controller;

import com.quantwork.ams.model.Resource;
import com.quantwork.ams.model.ResourceBooking;
import com.quantwork.ams.service.ActivityLogService;
import com.quantwork.ams.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<Resource>> getResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String companyId) {
        return ResponseEntity.ok(resourceService.getResources(type, search, companyId));
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(
            @RequestBody Resource resource,
            @RequestParam(defaultValue = "Admin") String currentUser,
            @RequestParam(required = false) String companyId) {

        if (companyId != null && !companyId.trim().isEmpty()) {
            resource.setCompanyId(companyId);
        }
        Resource saved = resourceService.saveResource(resource);
        activityLogService.logActivity(
                "Added shared resource: " + saved.getName(),
                "RESOURCE",
                currentUser,
                "CREATE_RESOURCE",
                saved.getCompanyId()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(
            @PathVariable String id,
            @RequestBody Resource updated,
            @RequestParam(defaultValue = "Admin") String currentUser) {

        return resourceService.getResourceById(id).map(existing -> {
            if (updated.getName() != null) existing.setName(updated.getName());
            if (updated.getType() != null) existing.setType(updated.getType());
            if (updated.getLocation() != null) existing.setLocation(updated.getLocation());
            if (updated.getCapacityInfo() != null) existing.setCapacityInfo(updated.getCapacityInfo());
            if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
            if (updated.getSpecifications() != null) existing.setSpecifications(updated.getSpecifications());

            Resource saved = resourceService.saveResource(existing);
            activityLogService.logActivity(
                    "Updated shared resource: " + saved.getName(),
                    "RESOURCE",
                    currentUser,
                    "UPDATE_RESOURCE",
                    saved.getCompanyId()
            );
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        boolean deleted = resourceService.deleteResource(id);
        if (deleted) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<ResourceBooking>> getBookings(@RequestParam(required = false) String companyId) {
        return ResponseEntity.ok(resourceService.getBookings(companyId));
    }

    @PostMapping("/bookings")
    public ResponseEntity<ResourceBooking> createBooking(
            @RequestBody ResourceBooking booking,
            @RequestParam(defaultValue = "Employee") String currentUser,
            @RequestParam(required = false) String companyId) {

        if (companyId != null && !companyId.trim().isEmpty()) {
            booking.setCompanyId(companyId);
        }
        ResourceBooking saved = resourceService.saveBooking(booking);
        activityLogService.logActivity(
                "Reserved " + saved.getResourceName() + " for " + saved.getDate() + " (" + saved.getStartTime() + " - " + saved.getEndTime() + ")",
                "BOOKING",
                currentUser,
                "CREATE_BOOKING",
                saved.getCompanyId()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/bookings/{id}/free")
    public ResponseEntity<ResourceBooking> freeBooking(
            @PathVariable String id,
            @RequestParam(defaultValue = "Employee") String currentUser) {

        ResourceBooking freed = resourceService.freeBooking(id);
        if (freed == null) {
            return ResponseEntity.notFound().build();
        }

        activityLogService.logActivity(
                "Freed booked resource: " + freed.getResourceName(),
                "BOOKING",
                currentUser,
                "FREE_RESOURCE",
                freed.getCompanyId()
        );
        return ResponseEntity.ok(freed);
    }
}
