package com.quantwork.ams.repository;

import com.quantwork.ams.model.Company;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends MongoRepository<Company, String> {
    Optional<Company> findByCode(String code);
}
