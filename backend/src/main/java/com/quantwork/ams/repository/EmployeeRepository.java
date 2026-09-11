package com.quantwork.ams.repository;

import com.quantwork.ams.model.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    Optional<Employee> findByEmail(String email);
    List<Employee> findByDepartment(String department);
    List<Employee> findByNameContainingIgnoreCaseOrDepartmentContainingIgnoreCase(String name, String department);
    void deleteByCompanyId(String companyId);
}
