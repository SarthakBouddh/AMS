package com.quantwork.ams.controller;

import com.quantwork.ams.model.ActivityLog;
import com.quantwork.ams.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getActivityLogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String companyId) {
        return ResponseEntity.ok(activityLogService.getAllActivities(search, companyId));
    }
}
