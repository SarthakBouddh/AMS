package com.quantwork.ams.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;
import java.util.List;
import com.quantwork.ams.model.ActivityLog;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalAssets;
    private long availableAssets;
    private double utilizationRate; // percentage
    private long assignedCount;
    private double portfolioValue;
    private long needsAttentionCount;
    private Map<String, Long> categoryCount;
    private Map<String, Double> categoryValue;
    private List<ActivityLog> recentActivities;
}
