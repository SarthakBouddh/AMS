package com.quantwork.ams.service;

import com.quantwork.ams.model.MaintenanceTicket;
import com.quantwork.ams.repository.MaintenanceTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MaintenanceTicketService {

    @Autowired
    private MaintenanceTicketRepository ticketRepository;

    public List<MaintenanceTicket> getTickets(String maintenanceType, String status, String search, String companyId) {
        List<MaintenanceTicket> tickets = ticketRepository.findAll();

        return tickets.stream()
                .filter(t -> companyId == null || companyId.trim().isEmpty() || "ALL".equalsIgnoreCase(companyId) || (t.getCompanyId() != null && t.getCompanyId().equals(companyId)))
                .filter(t -> maintenanceType == null || maintenanceType.equalsIgnoreCase("ALL") || (t.getMaintenanceType() != null && t.getMaintenanceType().equalsIgnoreCase(maintenanceType)))
                .filter(t -> status == null || status.equalsIgnoreCase("ALL") || (t.getStatus() != null && t.getStatus().equalsIgnoreCase(status)))
                .filter(t -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.toLowerCase();
                    return (t.getAssetName() != null && t.getAssetName().toLowerCase().contains(q))
                            || (t.getAssetTag() != null && t.getAssetTag().toLowerCase().contains(q))
                            || (t.getIssueKeyword() != null && t.getIssueKeyword().toLowerCase().contains(q))
                            || (t.getProblemDescription() != null && t.getProblemDescription().toLowerCase().contains(q))
                            || (t.getVendorName() != null && t.getVendorName().toLowerCase().contains(q))
                            || (t.getReportedBy() != null && t.getReportedBy().toLowerCase().contains(q));
                })
                .collect(Collectors.toList());
    }

    public Optional<MaintenanceTicket> getTicketById(String id) {
        return ticketRepository.findById(id);
    }

    public MaintenanceTicket saveTicket(MaintenanceTicket ticket) {
        if (ticket.getId() == null || ticket.getId().trim().isEmpty()) {
            ticket.setId(UUID.randomUUID().toString());
        }
        if (ticket.getCreatedAt() == null || ticket.getCreatedAt().trim().isEmpty()) {
            ticket.setCreatedAt(LocalDate.now().toString());
        }
        if (ticket.getMaintenanceType() == null || ticket.getMaintenanceType().trim().isEmpty()) {
            ticket.setMaintenanceType("REPAIR");
        }
        return ticketRepository.save(ticket);
    }

    public boolean deleteTicket(String id) {
        if (ticketRepository.existsById(id)) {
            ticketRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public void deleteTicketsByCompany(String companyId) {
        if (companyId == null || companyId.trim().isEmpty()) return;
        ticketRepository.deleteByCompanyId(companyId);
    }
}
