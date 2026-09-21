package com.quantwork.ams.repository;

import com.quantwork.ams.model.RequestItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RequestItemRepository extends MongoRepository<RequestItem, String> {
    List<RequestItem> findByCompanyId(String companyId);
    List<RequestItem> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
    Optional<RequestItem> findByEmployeeId(String employeeId);
    void deleteByCompanyId(String companyId);
}
