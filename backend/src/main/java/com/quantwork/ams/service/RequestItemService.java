package com.quantwork.ams.service;

import com.quantwork.ams.model.RequestItem;
import com.quantwork.ams.repository.RequestItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RequestItemService {

    @Autowired
    private RequestItemRepository requestItemRepository;

    public List<RequestItem> getRequests(String type, String companyId) {
        List<RequestItem> requests = requestItemRepository.findAll();

        return requests.stream()
                .filter(r -> companyId == null || companyId.trim().isEmpty() || "ALL".equalsIgnoreCase(companyId) || (r.getCompanyId() != null && r.getCompanyId().equals(companyId)))
                .filter(r -> type == null || type.equalsIgnoreCase("ALL") || (r.getRequestType() != null && r.getRequestType().equalsIgnoreCase(type)))
                .collect(Collectors.toList());
    }

    public Optional<RequestItem> getRequestById(String id) {
        return requestItemRepository.findById(id);
    }

    public RequestItem saveRequest(RequestItem request) {
        if (request.getId() == null || request.getId().trim().isEmpty()) {
            request.setId(UUID.randomUUID().toString());
        }
        if (request.getCreatedAt() == null || request.getCreatedAt().trim().isEmpty()) {
            request.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
        }
        if (request.getUpdatedAt() == null || request.getUpdatedAt().trim().isEmpty()) {
            request.setUpdatedAt(request.getCreatedAt());
        }
        if (request.getRequestType() == null || request.getRequestType().trim().isEmpty()) {
            request.setRequestType("NEW_ASSET");
        }
        if (request.getRequestCategory() == null || request.getRequestCategory().trim().isEmpty()) {
            request.setRequestCategory("Hardware");
        }
        if (request.getPriority() == null || request.getPriority().trim().isEmpty()) {
            request.setPriority("Medium");
        }
        if (request.getQuantity() == null || request.getQuantity().trim().isEmpty()) {
            request.setQuantity("1");
        }
        if (request.getManagerStatus() == null) request.setManagerStatus("PENDING");
        if (request.getAdminStatus() == null) request.setAdminStatus("PENDING");
        if (request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            request.setStatus(request.getManagerStatus());
        }

        return requestItemRepository.save(request);
    }

    public Optional<RequestItem> getRequestsByEmployee(String employeeId) {
        return requestItemRepository.findByEmployeeId(employeeId);
    }

    public List<RequestItem> getRequestsByEmployeeList(String employeeId) {
        return requestItemRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    public boolean isValidStatusTransition(String currentStatus, String nextStatus) {
        if (currentStatus == null || currentStatus.trim().isEmpty()) {
            return "PENDING".equalsIgnoreCase(nextStatus);
        }
        if ("PENDING".equalsIgnoreCase(currentStatus)) {
            return "APPROVED".equalsIgnoreCase(nextStatus) || "REJECTED".equalsIgnoreCase(nextStatus);
        }
        return false;
    }

    public boolean deleteRequest(String id) {
        if (requestItemRepository.existsById(id)) {
            requestItemRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public void deleteRequestsByCompany(String companyId) {
        if (companyId == null || companyId.trim().isEmpty()) return;
        requestItemRepository.deleteByCompanyId(companyId);
    }
}
