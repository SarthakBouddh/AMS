package com.quantwork.ams.controller;

import com.quantwork.ams.model.AssetAuditLog;
import com.quantwork.ams.service.AssetAuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AssetAuditLogController {

    @Autowired
    private AssetAuditLogService assetAuditLogService;

    @GetMapping("/assets/{assetId}/audit-logs")
    public ResponseEntity<List<AssetAuditLog>> getAssetAuditLogs(@PathVariable String assetId) {
        return ResponseEntity.ok(assetAuditLogService.getAuditLogsForAsset(assetId));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AssetAuditLog>> getAllAuditLogs(
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String assetId) {
        if (assetId != null && !assetId.trim().isEmpty()) {
            return ResponseEntity.ok(assetAuditLogService.getAuditLogsForAsset(assetId));
        }
        return ResponseEntity.ok(assetAuditLogService.getAuditLogsForCompany(companyId));
    }
}
