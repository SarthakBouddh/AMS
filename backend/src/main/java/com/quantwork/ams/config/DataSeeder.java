package com.quantwork.ams.config;

import com.quantwork.ams.model.*;
import com.quantwork.ams.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CompanyService companyService;

    @Autowired
    private AssetService assetService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private UserService userService;

    @Override
    public void run(String... args) throws Exception {
        seedCompanies();
        seedUsers();
        seedEmployees();
        seedAssets();
        seedActivityLogs();
    }

    private void seedCompanies() {
        // No hardcoded initial companies. Super Admin starts clean.
    }

    private void seedUsers() {
        List<User> users = Arrays.asList(
                // Super Admin Governance Credentials ONLY
                new User("u-sa", "SYSTEM", "Super Admin Governance", "Super Admin", "superadmin@quantworks.com", "superadmin123", "SUPER_ADMIN", "Executive", "SA", true)
        );
        userService.initSeedData(users);
    }

    private void seedEmployees() {
        // No hardcoded initial employees. Start clean.
    }

    private void seedAssets() {
        // No hardcoded initial assets. Start clean.
    }

    private void seedActivityLogs() {
        // Start clean.
    }
}
