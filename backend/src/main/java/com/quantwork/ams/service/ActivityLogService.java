package com.quantwork.ams.service;

import com.quantwork.ams.model.ActivityLog;
import com.quantwork.ams.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public List<ActivityLog> getRecentActivities(String companyId) {
        List<ActivityLog> logs = activityLogRepository.findTop10ByOrderByIdDesc();

        return logs.stream()
                .filter(l -> companyId == null || companyId.trim().isEmpty() || "ALL".equalsIgnoreCase(companyId) || (l.getCompanyId() != null && l.getCompanyId().equals(companyId)))
                .collect(Collectors.toList());
    }

    public List<ActivityLog> getAllActivities(String search, String companyId) {
        List<ActivityLog> logs = activityLogRepository.findAll();

        return logs.stream()
                .filter(l -> companyId == null || companyId.trim().isEmpty() || "ALL".equalsIgnoreCase(companyId) || (l.getCompanyId() != null && l.getCompanyId().equals(companyId)))
                .filter(l -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.toLowerCase();
                    return (l.getTitle() != null && l.getTitle().toLowerCase().contains(q))
                            || (l.getAssetTag() != null && l.getAssetTag().toLowerCase().contains(q))
                            || (l.getUser() != null && l.getUser().toLowerCase().contains(q))
                            || (l.getActionType() != null && l.getActionType().toLowerCase().contains(q));
                })
                .sorted((a, b) -> {
                    if (a.getTimestamp() != null && b.getTimestamp() != null) {
                        return b.getTimestamp().compareTo(a.getTimestamp());
                    }
                    return 0;
                })
                .collect(Collectors.toList());
    }

    public void logActivity(String title, String assetTag, String user, String actionType, String companyId) {
        ActivityLog log = new ActivityLog();
        log.setId(UUID.randomUUID().toString());
        log.setCompanyId(companyId != null ? companyId : "SYSTEM");
        log.setTitle(title);
        log.setAssetTag(assetTag != null ? assetTag : "SYSTEM");
        log.setUser(user != null ? user : "System");
        log.setActionType(actionType != null ? actionType : "GENERAL");
        log.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm")));

        activityLogRepository.save(log);
    }

    public void initSeedData(List<ActivityLog> seedLogs) {
        if (activityLogRepository.count() == 0) {
            activityLogRepository.saveAll(seedLogs);
        }
    }

    public void deleteLogsByCompany(String companyId) {
        if (companyId == null || companyId.trim().isEmpty()) return;
        List<ActivityLog> logs = activityLogRepository.findAll();
        logs.stream()
                .filter(l -> companyId.equals(l.getCompanyId()))
                .forEach(l -> activityLogRepository.deleteById(l.getId()));
    }
}
