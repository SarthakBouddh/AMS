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
}
