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

    public boolean deleteEmployee(String id) {
        if (employeeRepository.existsById(id)) {
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
