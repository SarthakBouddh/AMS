package com.quantwork.ams.service;

import com.quantwork.ams.model.Employee;
import com.quantwork.ams.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Employee> getAllEmployees(String search, String companyId) {
        List<Employee> list = employeeRepository.findAll();

        return list.stream()
                // Multi-Tenant Isolation Check
                .filter(e -> companyId == null || companyId.trim().isEmpty() || "ALL".equalsIgnoreCase(companyId) || (e.getCompanyId() != null && e.getCompanyId().equals(companyId)))
                .filter(e -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String query = search.toLowerCase();
                    return (e.getName() != null && e.getName().toLowerCase().contains(query))
                            || (e.getEmail() != null && e.getEmail().toLowerCase().contains(query))
                            || (e.getDepartment() != null && e.getDepartment().toLowerCase().contains(query));
                })
                .collect(Collectors.toList());
    }

    public Optional<Employee> getEmployeeById(String id) {
        return employeeRepository.findById(id);
    }

    public Employee saveEmployee(Employee emp) {
        if (emp.getId() == null || emp.getId().trim().isEmpty()) {
            emp.setId(UUID.randomUUID().toString());
        }
        if (emp.getInitials() == null || emp.getInitials().isEmpty()) {
            emp.setInitials(createInitials(emp.getName()));
        }

        return employeeRepository.save(emp);
    }

    @Autowired
    private com.quantwork.ams.repository.AssetRepository assetRepository;

    @Autowired
    private com.quantwork.ams.repository.UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private AssetAuditLogService assetAuditLogService;

    public boolean deleteEmployee(String id) {
        return deleteEmployee(id, "Admin", null);
    }

    public boolean deleteEmployee(String id, String currentUser, String userId) {
        Optional<Employee> empOpt = employeeRepository.findById(id);
        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            String empName = emp.getName() != null ? emp.getName() : "Employee";
            String empEmail = emp.getEmail();

            // 1. Auto-unassign all assets currently assigned to this employee
            List<com.quantwork.ams.model.Asset> assignedAssets = assetRepository.findByOwnerId(id);
            if (assignedAssets.isEmpty() && empName != null && !empName.isBlank()) {
                // Fallback check by name if ownerId was missing
                List<com.quantwork.ams.model.Asset> allCompanyAssets = assetRepository.findAll();
                assignedAssets = allCompanyAssets.stream()
                        .filter(a -> empName.equalsIgnoreCase(a.getOwnerName()))
                        .collect(Collectors.toList());
            }

            for (com.quantwork.ams.model.Asset asset : assignedAssets) {
                asset.setOwnerId(null);
                asset.setOwnerName("Unassigned");
                asset.setStatus("Available");
                assetRepository.save(asset);

                String actor = currentUser != null ? currentUser : "System";
                activityLogService.logActivity(
                        "Auto-collected asset " + asset.getName() + " (" + asset.getAssetTag() + ") back to inventory due to employee removal (" + empName + ")",
                        asset.getAssetTag(),
                        actor,
                        "UNASSIGN",
                        asset.getCompanyId()
                );
                assetAuditLogService.recordAssetEvent(
                        asset.getId(),
                        asset.getCompanyId(),
                        asset.getAssetTag(),
                        "ASSET_UNASSIGNED",
                        "Asset unassigned automatically because assigned employee (" + empName + ") was deleted",
                        actor,
                        userId
                );
            }

            // 2. Revoke user credentials for matching employee email
            if (empEmail != null && !empEmail.isBlank()) {
                Optional<com.quantwork.ams.model.User> userOpt = userRepository.findByEmailIgnoreCase(empEmail.toLowerCase().trim());
                userOpt.ifPresent(u -> {
                    u.setRevoked(true);
                    userRepository.save(u);
                    activityLogService.logActivity(
                            "Revoked user credentials for deleted employee: " + empEmail,
                            "PEOPLE",
                            currentUser != null ? currentUser : "System",
                            "REVOKE_CREDENTIALS",
                            emp.getCompanyId()
                    );
                });
            }

            // 3. Delete employee record
            employeeRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public void initSeedData(List<Employee> seedEmployees) {
        if (employeeRepository.count() == 0) {
            employeeRepository.saveAll(seedEmployees);
        }
    }

    public void deleteEmployeesByCompany(String companyId) {
        if (companyId == null || companyId.trim().isEmpty()) return;
        employeeRepository.deleteByCompanyId(companyId);
    }

    private String createInitials(String name) {
        if (name == null || name.trim().isEmpty()) return "EM";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }
}
