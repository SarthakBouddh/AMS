package com.quantwork.ams.service;

import com.quantwork.ams.model.Company;
import com.quantwork.ams.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private AssetService assetService;

    @Autowired
    private ActivityLogService activityLogService;

    public List<Company> getAllCompanies(String search) {
        List<Company> list = companyRepository.findAll();

        if (search == null || search.trim().isEmpty()) {
            return list;
        }

        String query = search.toLowerCase();
        return list.stream()
                .filter(c -> (c.getName() != null && c.getName().toLowerCase().contains(query))
                        || (c.getCode() != null && c.getCode().toLowerCase().contains(query))
                        || (c.getDomain() != null && c.getDomain().toLowerCase().contains(query)))
                .collect(Collectors.toList());
    }

    public Optional<Company> getCompanyById(String id) {
        return companyRepository.findById(id);
    }

    public Company saveCompany(Company company) {
        if (company.getId() == null || company.getId().trim().isEmpty()) {
            company.setId("comp-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (company.getCreatedAt() == null) {
            company.setCreatedAt(LocalDate.now().toString());
        }
        if (company.getStatus() == null) {
            company.setStatus("Active");
        }

        return companyRepository.save(company);
    }

    public Company updateCompany(String id, Company details) {
        Optional<Company> existingOpt = companyRepository.findById(id);
        if (existingOpt.isEmpty()) return null;

        Company existing = existingOpt.get();
        if (details.getName() != null) existing.setName(details.getName());
        if (details.getCode() != null) existing.setCode(details.getCode());
        if (details.getDomain() != null) existing.setDomain(details.getDomain());
        if (details.getStatus() != null) existing.setStatus(details.getStatus());
        if (details.getSubscriptionPlan() != null) existing.setSubscriptionPlan(details.getSubscriptionPlan());
        if (details.getContactEmail() != null) existing.setContactEmail(details.getContactEmail());

        return companyRepository.save(existing);
    }

    public boolean deleteCompany(String id) {
        Company company = getCompanyById(id).orElse(null);
        String companyName = company != null ? company.getName() : id;

        if (companyRepository.existsById(id)) {
            companyRepository.deleteById(id);

            // Cascade delete credentials, employees, assets linked to this company from MongoDB
            if (userService != null) userService.deleteUsersByCompany(id);
            if (employeeService != null) employeeService.deleteEmployeesByCompany(id);
            if (assetService != null) assetService.deleteAssetsByCompany(id);

            // Log company deletion event
            if (activityLogService != null) {
                activityLogService.logActivity(
                    id,
                    "Company tenant (" + companyName + ") and credentials purged by Super Admin. Historical audit lineage preserved.",
                    "SYSTEM",
                    "Super Admin",
                    "PURGE_COMPANY"
                );
            }
            return true;
        }
        return false;
    }

    public void initSeedData(List<Company> seedCompanies) {
        if (companyRepository.count() == 0) {
            companyRepository.saveAll(seedCompanies);
        }
    }
}
