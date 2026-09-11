package com.quantwork.ams.controller;

import com.quantwork.ams.dto.DashboardStats;
import com.quantwork.ams.model.Asset;

import com.quantwork.ams.service.ActivityLogService;
import com.quantwork.ams.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats(@RequestParam(required = false) String companyId) {
        List<Asset> assets = assetService.getAllAssets(null, null, null, companyId);
        
        long total = assets.size();
        long available = assets.stream().filter(a -> "Available".equalsIgnoreCase(a.getStatus())).count();
        long assigned = assets.stream().filter(a -> "Assigned".equalsIgnoreCase(a.getStatus())).count();
        long maintenance = assets.stream().filter(a -> "Maintenance".equalsIgnoreCase(a.getStatus())).count();

        double utilRate = total > 0 ? (double) assigned / total * 100.0 : 0.0;
        double totalValue = assets.stream().mapToDouble(a -> a.getValue() != null ? a.getValue() : 0.0).sum();

        Map<String, Long> catCount = new HashMap<>();
        Map<String, Double> catVal = new HashMap<>();

        for (Asset a : assets) {
            String cat = a.getCategory() != null ? a.getCategory() : "Other";
            double val = a.getValue() != null ? a.getValue() : 0.0;
            catCount.put(cat, catCount.getOrDefault(cat, 0L) + 1);
            catVal.put(cat, catVal.getOrDefault(cat, 0.0) + val);
        }

        DashboardStats stats = new DashboardStats();
        stats.setTotalAssets(total);
        stats.setAvailableAssets(available);
        stats.setUtilizationRate(Math.round(utilRate * 10.0) / 10.0);
        stats.setAssignedCount(assigned);
        stats.setPortfolioValue(totalValue);
        stats.setNeedsAttentionCount(maintenance);
        stats.setCategoryCount(catCount);
        stats.setCategoryValue(catVal);
        stats.setRecentActivities(activityLogService.getRecentActivities(companyId));

        return ResponseEntity.ok(stats);
    }
}
