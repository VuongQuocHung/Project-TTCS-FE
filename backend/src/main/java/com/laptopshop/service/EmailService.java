package com.laptopshop.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendResetPasswordEmail(String to, String token) {
        String subject = "Password Reset Request";
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;
        String message = "To reset your password, click the link below:\n" + resetUrl;

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(message);
        email.setFrom("vuduc07092005@gmail.com");

        mailSender.send(email);
    }

    @Async
    public void sendOrderSuccessEmail(String to, Long orderId, Double amount) {
        String subject = "Thanh toán đơn hàng thành công - Laptop Shop";
        String message = String.format(
            "Chào bạn,\n\n" +
            "Chúc mừng! Đơn hàng #%d của bạn đã được thanh toán thành công.\n" +
            "Số tiền đã thanh toán: %,.0f VNĐ.\n\n" +
            "Chúng tôi sẽ sớm tiến hành chuẩn bị và giao hàng cho bạn.\n" +
            "Cảm ơn bạn đã tin tưởng mua sắm tại Laptop Shop!",
            orderId, amount
        );

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(message);
        email.setFrom("laptopshop@gmail.com");

        mailSender.send(email);
    }

    @Async
    public void sendVerificationEmail(String to, String fullName, String token) {
        String subject = "Xác thực tài khoản - Laptop Shop";
        String verifyUrl = "http://localhost:3000/verify-email?token=" + token;
        String message = String.format(
            "Chào %s,\n\n" +
            "Cảm ơn bạn đã đăng ký tài khoản tại Laptop Shop.\n" +
            "Vui lòng click vào đường link bên dưới để xác thực tài khoản của bạn:\n" +
            "%s\n\n" +
            "Trân trọng,\n" +
            "Đội ngũ Laptop Shop",
            fullName, verifyUrl
        );

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(message);
        email.setFrom("laptopshop@gmail.com");

        mailSender.send(email);
    }
}
