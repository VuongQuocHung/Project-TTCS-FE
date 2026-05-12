package com.laptopshop.controller.auth;

import com.laptopshop.dto.*;
import com.laptopshop.entity.Role;
import com.laptopshop.entity.User;
import com.laptopshop.repository.UserRepository;
import com.laptopshop.security.GoogleAuthService;
import com.laptopshop.security.JwtTokenProvider;
import com.laptopshop.service.UserService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Xác thực người dùng (Login, Register, Password)")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService;
    private final GoogleAuthService googleAuthService;
    private final com.laptopshop.service.EmailService emailService;

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        try {
            GoogleIdToken idToken = googleAuthService.verify(request.getIdToken());
            if (idToken == null) {
                return ResponseEntity.badRequest().build();
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            User user = userService.getOrCreateUserFromGoogle(email, name);
            String token = tokenProvider.generateToken(user.getUsername());
            String refreshToken = tokenProvider.generateRefreshToken(user.getUsername());

            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .username(user.getUsername())
                    .role(user.getRole().name())
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@Valid @RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
        if (!user.isEnabled()) {
            return ResponseEntity.status(403).body(AuthResponse.builder().username(loginRequest.getUsername()).build()); // Or
                                                                                                                         // a
                                                                                                                         // custom
                                                                                                                         // response
                                                                                                                         // to
                                                                                                                         // indicate
                                                                                                                         // unverified
        }

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), loginRequest.getPassword()));

        String token = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build());
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (tokenProvider.validateToken(refreshToken)) {
            String username = tokenProvider.getUsername(refreshToken);
            User user = userRepository.findByUsername(username).orElseThrow();

            if (refreshToken.equals(user.getRefreshToken())) {
                String newToken = tokenProvider.generateToken(username, 86400000); // 1 day access token
                return ResponseEntity.ok(AuthResponse.builder()
                        .token(newToken)
                        .refreshToken(refreshToken)
                        .username(user.getUsername())
                        .role(user.getRole().name())
                        .build());
            }
        }

        return ResponseEntity.badRequest().body("Token làm mới không hợp lệ");
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Tên đăng nhập đã được sử dụng!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email đã được sử dụng!");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Mật khẩu xác nhận không khớp!");
        }

        String verificationToken = java.util.UUID.randomUUID().toString();

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .role(Role.CUSTOMER)
                .enabled(false) // User must verify email
                .verificationToken(verificationToken)
                .build();

        userRepository.save(user);

        // Gửi email xác thực
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationToken);
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
        }

        return ResponseEntity.ok("Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body("Token là bắt buộc!");
        }

        User user = userRepository.findByVerificationToken(token)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("Mã xác thực không hợp lệ!");
        }

        user.setEnabled(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        return ResponseEntity.ok("Xác thực email thành công. Bạn đã có thể đăng nhập.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.processForgotPassword(request.getEmail());
        return ResponseEntity.ok("Email hướng dẫn đặt lại mật khẩu đã được gửi đi.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Đặt lại mật khẩu thành công!");
    }
}
