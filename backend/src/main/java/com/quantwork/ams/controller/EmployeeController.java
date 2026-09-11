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

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private AssetService assetService;

    @Autowired
    private ActivityLogService activityLogService;

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
        activityLogService.logActivity(
                "Added new employee " + created.getName() + " (" + created.getDepartment() + ")",
                "PEOPLE",
                currentUser,
                "ADD",
                created.getCompanyId()
        );
        return ResponseEntity.ok(created);
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
    public ResponseEntity<Void> deleteEmployee(@PathVariable String id, @RequestParam(defaultValue = "Admin") String currentUser) {
        employeeService.getEmployeeById(id).ifPresent(emp -> {
            activityLogService.logActivity(
                    "Removed employee " + emp.getName() + " from organization",
                    "PEOPLE",
                    currentUser,
                    "DELETE_EMPLOYEE",
                    emp.getCompanyId()
            );
        });
        boolean deleted = employeeService.deleteEmployee(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
