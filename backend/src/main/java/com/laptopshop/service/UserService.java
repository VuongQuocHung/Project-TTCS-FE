package com.laptopshop.service;

import com.laptopshop.dto.*;
import com.laptopshop.entity.Branch;
import com.laptopshop.entity.Role;
import com.laptopshop.entity.User;
import com.laptopshop.mapper.UserMapper;
import com.laptopshop.repository.BranchRepository;
import com.laptopshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserDTO getProfile(Long userId) {
        return userRepository.findById(userId)
                .map(userMapper::toDto)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public UserDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password does not match");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // Admin operations
    public PageResponseDTO<UserDTO> getUsers(UserFilterRequest filter, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        org.springframework.data.domain.Page<User> userPage = userRepository.findAll(com.laptopshop.repository.specification.UserSpecification.filter(filter), pageable);
        return PageResponseDTO.of(userPage.map(userMapper::toDto));
    }

    public UserDTO getUser(Long userId) {
        return userRepository.findById(userId)
                .map(userMapper::toDto)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public UserDTO createUser(AdminUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .role(request.getRole() != null ? request.getRole() : Role.CUSTOMER)
                .enabled(request.getEnabled() == null || request.getEnabled())
                .branch(resolveBranch(request.getBranchId()))
                .build();

        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public UserDTO updateUser(Long userId, AdminUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setRole(request.getRole() != null ? request.getRole() : Role.CUSTOMER);
        user.setEnabled(request.getEnabled() == null || request.getEnabled());
        user.setBranch(resolveBranch(request.getBranchId()));

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return userMapper.toDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    @Transactional
    public UserDTO assignManagerToBranch(Long userId, Long branchId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        
        user.setRole(Role.MANAGER);
        user.setBranch(branch);
        return userMapper.toDto(userRepository.save(user));
    }

    private Branch resolveBranch(Long branchId) {
        if (branchId == null) {
            return null;
        }
        return branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
    }

    @Transactional
    public void toggleUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(enabled);
        userRepository.save(user);
    }

    @Transactional
    public void processForgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này!"));
        
        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        emailService.sendResetPasswordEmail(user.getEmail(), user.getFullName(), token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Mã xác thực không hợp lệ hoặc đã hết hạn!"));
        
        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn!");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void updateUserRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        userRepository.save(user);
    }

    @Transactional
    public User getOrCreateUserFromGoogle(String email, String fullName) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    if (user.getProvider() == null) {
                        user.setProvider("GOOGLE");
                        userRepository.save(user);
                    }
                    return user;
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .username(email)
                            .email(email)
                            .fullName(fullName)
                            .role(Role.CUSTOMER)
                            .provider("GOOGLE")
                            .enabled(true)
                            .build();
                    return userRepository.save(newUser);
                });
    }
}
