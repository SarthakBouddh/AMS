package com.quantwork.ams.controller;

import com.quantwork.ams.model.Asset;
import com.quantwork.ams.model.Employee;
import com.quantwork.ams.service.ActivityLogService;
import com.quantwork.ams.service.AssetService;
import com.quantwork.ams.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.quantwork.ams.model.User;
import com.quantwork.ams.service.UserService;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private AssetService assetService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityLogService activityLogService;

    private void syncUserCredentialsForEmployee(Employee emp) {
        if (emp == null || emp.getEmail() == null || emp.getEmail().trim().isEmpty()) return;

        String rawRole = emp.getRole() != null ? emp.getRole() : "Employee";
        String lowRole = rawRole.toLowerCase();

        // ONLY Admin credentials should NOT be created from Add People
        if (lowRole.contains("admin") || lowRole.contains("superadmin")) {
            return;
        }

        String normalizedRole = "Employee";
        if (lowRole.contains("head") || lowRole.contains("lead") || lowRole.contains("operations")) {
            normalizedRole = "Operational Head";
        } else if (lowRole.contains("manager") || lowRole.contains("supervisor")) {
            normalizedRole = "Manager";
        }

        String email = emp.getEmail().toLowerCase().trim();
        List<User> existingCompanyUsers = userService.getUsersByCompany(emp.getCompanyId());
        java.util.Optional<User> existingUserOpt = existingCompanyUsers.stream()
                .filter(u -> email.equalsIgnoreCase(u.getEmail()))
                .findFirst();

        if (existingUserOpt.isEmpty()) {
            String rawPassword = (emp.getPassword() != null && !emp.getPassword().trim().isEmpty())
                    ? emp.getPassword().trim()
                    : (emp.getName() != null ? emp.getName().split("\\s+")[0].toLowerCase().replaceAll("[^a-z0-9]", "") + "123" : "user123");
            if (rawPassword.length() < 4) rawPassword = "user123";
            
            User newUser = new User();
            newUser.setCompanyId(emp.getCompanyId() != null ? emp.getCompanyId() : "comp-default");
            newUser.setCompanyName(emp.getCompanyName() != null ? emp.getCompanyName() : "Company");
            newUser.setName(emp.getName());
            newUser.setEmail(email);
            newUser.setPassword(rawPassword);
            newUser.setRole(normalizedRole);
            newUser.setDepartment(emp.getDepartment() != null ? emp.getDepartment() : "Operations");
            userService.createUser(newUser);
        } else {
            User existing = existingUserOpt.get();
            existing.setName(emp.getName());
            existing.setDepartment(emp.getDepartment());
            existing.setRole(normalizedRole);
            if (emp.getCompanyId() != null) existing.setCompanyId(emp.getCompanyId());
            if (emp.getCompanyName() != null) existing.setCompanyName(emp.getCompanyName());
            userService.updateUser(existing.getId(), existing);
        }
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String companyId) {
        
        List<Employee> employees = employeeService.getAllEmployees(search, companyId);
        List<Asset> allAssets = assetService.getAllAssets(null, null, null, companyId);
        
        for (Employee emp : employees) {
            long assignedCount = allAssets.stream()
                    .filter(a -> emp.getId().equals(a.getOwnerId()))
                    .count();
            if (assignedCount > 0) {
                emp.setStatus(assignedCount + (assignedCount == 1 ? " asset assigned" : " assets assigned"));
            } else {
                emp.setStatus("Available for assignment");
            }
        }
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable String id) {
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(
            @RequestBody Employee employee,
            @RequestParam(defaultValue = "Mara Singh") String currentUser,
            @RequestParam(required = false) String companyId) {
        
        if (companyId != null && !companyId.trim().isEmpty()) {
            employee.setCompanyId(companyId);
        }
        Employee created = employeeService.saveEmployee(employee);
        syncUserCredentialsForEmployee(created);

        activityLogService.logActivity(
                "Added new employee " + created.getName() + " (" + created.getDepartment() + ")",
                "PEOPLE",
                currentUser,
                "ADD",
                created.getCompanyId()
        );
        return ResponseEntity.ok(created);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Employee>> bulkCreateEmployees(
            @RequestBody List<Employee> employees,
            @RequestParam(defaultValue = "Mara Singh") String currentUser,
            @RequestParam(required = false) String companyId) {

        List<Employee> createdList = new java.util.ArrayList<>();
        for (Employee emp : employees) {
            if (companyId != null && !companyId.trim().isEmpty()) {
                emp.setCompanyId(companyId);
            }
            Employee created = employeeService.saveEmployee(emp);
            syncUserCredentialsForEmployee(created);
            createdList.add(created);
        }
        activityLogService.logActivity(
                "Bulk uploaded " + createdList.size() + " team members to directory",
                "PEOPLE",
                currentUser,
                "BULK_ADD_PEOPLE",
                companyId
        );
        return ResponseEntity.ok(createdList);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable String id, @RequestBody Employee employeeDetails, @RequestParam(defaultValue = "Admin") String currentUser) {
        return employeeService.getEmployeeById(id)
                .map(existing -> {
                    existing.setName(employeeDetails.getName());
                    existing.setEmail(employeeDetails.getEmail());
                    existing.setDepartment(employeeDetails.getDepartment());
                    existing.setRole(employeeDetails.getRole());
                    existing.setLocation(employeeDetails.getLocation());
                    if (employeeDetails.getCompanyId() != null) {
                        existing.setCompanyId(employeeDetails.getCompanyId());
                        existing.setCompanyName(employeeDetails.getCompanyName());
                    }
                    if (employeeDetails.getAvatarBg() != null) {
                        existing.setAvatarBg(employeeDetails.getAvatarBg());
                    }
                    Employee saved = employeeService.saveEmployee(existing);
                    syncUserCredentialsForEmployee(saved);
                    activityLogService.logActivity(
                            "Updated employee profile: " + saved.getName(),
                            "PEOPLE",
                            currentUser,
                            "UPDATE_EMPLOYEE",
                            saved.getCompanyId()
                    );
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(
            @PathVariable String id,
            @RequestParam(defaultValue = "Admin") String currentUser,
            @RequestParam(required = false) String userId) {
        employeeService.getEmployeeById(id).ifPresent(emp -> {
            activityLogService.logActivity(
                    "Removed employee " + emp.getName() + " from organization",
                    "PEOPLE",
                    currentUser,
                    "DELETE_EMPLOYEE",
                    emp.getCompanyId()
            );
        });
        boolean deleted = employeeService.deleteEmployee(id, currentUser, userId);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
