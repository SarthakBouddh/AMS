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
        if (request.getManagerStatus() == null) request.setManagerStatus("PENDING");
        if (request.getAdminStatus() == null) request.setAdminStatus("PENDING");

        return requestItemRepository.save(request);
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
