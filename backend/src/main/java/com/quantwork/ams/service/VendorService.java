package com.quantwork.ams.service;

import com.quantwork.ams.model.Vendor;
import com.quantwork.ams.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    public List<Vendor> getAllVendors(String search, String category, String companyId) {
        List<Vendor> vendors = vendorRepository.findAll();

        return vendors.stream()
                .filter(v -> companyId == null || companyId.trim().isEmpty() || "ALL".equalsIgnoreCase(companyId) || (v.getCompanyId() != null && v.getCompanyId().equals(companyId)))
                .filter(v -> category == null || category.equalsIgnoreCase("All") || (v.getCategory() != null && v.getCategory().equalsIgnoreCase(category)))
                .filter(v -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.toLowerCase();
                    return (v.getName() != null && v.getName().toLowerCase().contains(q))
                            || (v.getContactPerson() != null && v.getContactPerson().toLowerCase().contains(q))
                            || (v.getEmail() != null && v.getEmail().toLowerCase().contains(q))
                            || (v.getCategory() != null && v.getCategory().toLowerCase().contains(q));
                })
                .collect(Collectors.toList());
    }

    public Optional<Vendor> getVendorById(String id) {
        return vendorRepository.findById(id);
    }

    public Vendor saveVendor(Vendor vendor) {
        if (vendor.getId() == null || vendor.getId().trim().isEmpty()) {
            vendor.setId(UUID.randomUUID().toString());
        }
        if (vendor.getCreatedAt() == null || vendor.getCreatedAt().trim().isEmpty()) {
            vendor.setCreatedAt(LocalDate.now().toString());
        }
        return vendorRepository.save(vendor);
    }

    public boolean deleteVendor(String id) {
        if (vendorRepository.existsById(id)) {
            vendorRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public void deleteVendorsByCompany(String companyId) {
        if (companyId == null || companyId.trim().isEmpty()) return;
        vendorRepository.deleteByCompanyId(companyId);
    }
}
