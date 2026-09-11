package com.quantwork.ams.repository;

import com.quantwork.ams.model.Vendor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorRepository extends MongoRepository<Vendor, String> {
    List<Vendor> findByCompanyId(String companyId);
    void deleteByCompanyId(String companyId);
}
