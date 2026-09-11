package com.quantwork.ams.repository;

import com.quantwork.ams.model.ActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    List<ActivityLog> findTop10ByOrderByIdDesc();
}
