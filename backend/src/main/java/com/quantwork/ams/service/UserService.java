package com.quantwork.ams.service;

import com.quantwork.ams.dto.LoginRequest;
import com.quantwork.ams.dto.LoginResponse;
import com.quantwork.ams.model.User;
import com.quantwork.ams.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public LoginResponse authenticate(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        String password = request.getPassword() != null ? request.getPassword().trim() : "";

        if (email.isEmpty() || password.isEmpty()) {
            return new LoginResponse(false, "Email and password are required", null, null, null, null, null, null, null, null, null, false);
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        User foundUser = userOpt.orElse(null);

        if (foundUser != null && passwordEncoder.matches(password, foundUser.getPassword())) {
            return new LoginResponse(
                    true,
                    "Login successful",
                    "token-" + UUID.randomUUID(),
                    foundUser.getId(),
                    foundUser.getCompanyId() != null ? foundUser.getCompanyId() : "SYSTEM",
                    foundUser.getCompanyName() != null ? foundUser.getCompanyName() : "System",
                    foundUser.getName(),
                    foundUser.getEmail(),
                    foundUser.getRole(),
                    foundUser.getDepartment(),
                    foundUser.getInitials(),
                    foundUser.isSuperAdmin()
            );
        }

        // Fallback for default Super Admin if database isn't seeded yet
        if ("superadmin@quantworks.com".equalsIgnoreCase(email) && "superadmin123".equals(password)) {
            User sa = new User("u-sa", "SYSTEM", "System Governance", "Super Admin", "superadmin@quantworks.com", passwordEncoder.encode("superadmin123"), "SUPER_ADMIN", "Executive", "SA", true);
            userRepository.save(sa);
            return new LoginResponse(
                    true,
                    "Super Admin Authenticated",
                    "token-superadmin-" + UUID.randomUUID(),
                    sa.getId(),
                    sa.getCompanyId(),
                    sa.getCompanyName(),
                    sa.getName(),
                    sa.getEmail(),
                    sa.getRole(),
                    sa.getDepartment(),
                    sa.getInitials(),
                    true
            );
        }

        return new LoginResponse(false, "Invalid credentials", null, null, null, null, null, null, null, null, null, false);
    }

    public List<User> getUsersByCompany(String companyId) {
        if (companyId == null || "ALL".equalsIgnoreCase(companyId)) {
            return userRepository.findAll();
        }
        return userRepository.findByCompanyId(companyId);
    }

    public User createUser(User user) {
        if (user.getId() == null || user.getId().trim().isEmpty()) {
            user.setId("u-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (user.getEmail() != null) {
            user.setEmail(user.getEmail().toLowerCase().trim());
        }
        if (user.getInitials() == null || user.getInitials().isEmpty()) {
            String n = user.getName() != null ? user.getName() : "User";
            user.setInitials(createInitials(n));
        }
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword().trim()));
        }

        return userRepository.save(user);
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public User updateUser(String id, User details) {
        Optional<User> existingOpt = userRepository.findById(id);
        if (existingOpt.isEmpty()) return null;

        User existing = existingOpt.get();
        if (details.getName() != null) existing.setName(details.getName());
        if (details.getEmail() != null) existing.setEmail(details.getEmail().toLowerCase().trim());
        if (details.getPassword() != null && !details.getPassword().trim().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(details.getPassword().trim()));
        }
        if (details.getRole() != null) existing.setRole(details.getRole());
        if (details.getDepartment() != null) existing.setDepartment(details.getDepartment());
        if (details.getCompanyId() != null) existing.setCompanyId(details.getCompanyId());
        if (details.getCompanyName() != null) existing.setCompanyName(details.getCompanyName());

        if (existing.getName() != null) {
            existing.setInitials(createInitials(existing.getName()));
        }

        return userRepository.save(existing);
    }

    public boolean deleteUser(String id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public void deleteUsersByCompany(String companyId) {
        if (companyId == null || companyId.trim().isEmpty()) return;
        userRepository.deleteByCompanyId(companyId);
    }

    public void initSeedData(List<User> seedUsers) {
        for (User user : seedUsers) {
            if (user.getEmail() != null) {
                user.setEmail(user.getEmail().toLowerCase().trim());
            }
            if (userRepository.findByEmailIgnoreCase(user.getEmail()).isEmpty()) {
                if (user.getPassword() != null) {
                    user.setPassword(passwordEncoder.encode(user.getPassword().trim()));
                }
                userRepository.save(user);
            }
        }
    }

    private String createInitials(String name) {
        if (name == null || name.trim().isEmpty()) return "US";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }
}
