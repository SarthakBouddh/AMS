package com.quantwork.ams.service;

import com.quantwork.ams.model.Resource;
import com.quantwork.ams.model.ResourceBooking;
import com.quantwork.ams.repository.ResourceBookingRepository;
import com.quantwork.ams.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ResourceBookingRepository bookingRepository;

    public List<Resource> getResources(String type, String search, String companyId) {
        List<Resource> resources = resourceRepository.findAll();

        return resources.stream()
                .filter(r -> companyId == null || companyId.trim().isEmpty() || "ALL".equalsIgnoreCase(companyId) || (r.getCompanyId() != null && r.getCompanyId().equals(companyId)))
                .filter(r -> type == null || type.equalsIgnoreCase("ALL") || (r.getType() != null && r.getType().equalsIgnoreCase(type)))
                .filter(r -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.toLowerCase();
                    return (r.getName() != null && r.getName().toLowerCase().contains(q))
                            || (r.getLocation() != null && r.getLocation().toLowerCase().contains(q))
                            || (r.getSpecifications() != null && r.getSpecifications().toLowerCase().contains(q));
                })
                .collect(Collectors.toList());
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public Resource saveResource(Resource resource) {
        if (resource.getId() == null || resource.getId().trim().isEmpty()) {
            resource.setId(UUID.randomUUID().toString());
        }
        if (resource.getStatus() == null || resource.getStatus().trim().isEmpty()) {
            resource.setStatus("AVAILABLE");
        }
        return resourceRepository.save(resource);
    }

    public boolean deleteResource(String id) {
        if (resourceRepository.existsById(id)) {
            resourceRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<ResourceBooking> getBookings(String companyId) {
        List<ResourceBooking> bookings = bookingRepository.findAll();

        return bookings.stream()
                .filter(b -> companyId == null || companyId.trim().isEmpty() || "ALL".equalsIgnoreCase(companyId) || (b.getCompanyId() != null && b.getCompanyId().equals(companyId)))
                .collect(Collectors.toList());
    }

    public ResourceBooking saveBooking(ResourceBooking booking) {
        if (booking.getId() == null || booking.getId().trim().isEmpty()) {
            booking.setId(UUID.randomUUID().toString());
        }
        if (booking.getStatus() == null || booking.getStatus().trim().isEmpty()) {
            booking.setStatus("CONFIRMED");
        }
        return bookingRepository.save(booking);
    }

    public void deleteResourcesByCompany(String companyId) {
        if (companyId == null || companyId.trim().isEmpty()) return;
        resourceRepository.deleteByCompanyId(companyId);
        bookingRepository.deleteByCompanyId(companyId);
    }
}
