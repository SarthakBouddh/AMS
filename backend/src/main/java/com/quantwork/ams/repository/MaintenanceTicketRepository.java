package com.quantwork.ams.repository;

import com.quantwork.ams.model.MaintenanceTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceTicketRepository extends MongoRepository<MaintenanceTicket, String> {
    List<MaintenanceTicket> findByCompanyId(String companyId);
    void deleteByCompanyId(String companyId);
}
