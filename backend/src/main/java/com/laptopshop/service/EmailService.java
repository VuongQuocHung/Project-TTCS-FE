package com.laptopshop.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendResetPasswordEmail(String to, String fullName, String token) {
        String subject = "Đặt lại mật khẩu - Laptop Shop";
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;
        
        String content = String.format(
            "<div style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">" +
            "    <h2 style=\"color: #0056b3;\">Chào %s,</h2>" +
            "    <p>Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>" +
            "    <p>Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>" +
            "    <div style=\"text-align: center; margin: 20px 0;\">" +
            "        <a href=\"%s\" style=\"background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">Đặt lại mật khẩu</a>" +
            "    </div>" +
            "    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.</p>" +
            "    <br/>" +
            "    <p>Chúc bạn một ngày tốt lành!</p>" +
            "    <p>Trân trọng,<br/><strong>Đội ngũ Laptop Shop</strong></p>" +
            "</div>",
            fullName, resetUrl
        );

        sendHtmlEmail(to, subject, content);
    }

    @Async
    public void sendOrderSuccessEmail(String to, Long orderId, Double amount) {
        String subject = "Thanh toán đơn hàng thành công - Laptop Shop";
        String content = String.format(
            "<div style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">" +
            "    <h2 style=\"color: #02b875;\">Chào bạn,</h2>" +
            "    <p>Chúc mừng! Đơn hàng <strong>#%d</strong> của bạn đã được thanh toán thành công.</p>" +
            "    <p>Số tiền đã thanh toán: <strong>%,.0f VNĐ</strong>.</p>" +
            "    <p>Chúng tôi sẽ sớm tiến hành chuẩn bị và giao hàng cho bạn.</p>" +
            "    <br/>" +
            "    <p>Chúc bạn một ngày vui vẻ!</p>" +
            "    <p>Cảm ơn bạn đã tin tưởng mua sắm tại Laptop Shop!</p>" +
            "    <p>Trân trọng,<br/><strong>Đội ngũ Laptop Shop</strong></p>" +
            "</div>",
            orderId, amount
        );

        sendHtmlEmail(to, subject, content);
    }

    @Async
    public void sendVerificationEmail(String to, String fullName, String token) {
        String subject = "Xác thực tài khoản - Laptop Shop";
        String verifyUrl = "http://localhost:3000/verify-email?token=" + token;
        
        String content = String.format(
            "<div style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">" +
            "    <h2 style=\"color: #0056b3;\">Chào %s,</h2>" +
            "    <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Laptop Shop</strong>.</p>" +
            "    <p>Vui lòng click vào nút bên dưới để xác thực tài khoản của bạn:</p>" +
            "    <div style=\"text-align: center; margin: 20px 0;\">" +
            "        <a href=\"%s\" style=\"background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;\">Xác thực tài khoản</a>" +
            "    </div>" +
            "    <br/>" +
            "    <p>Chúc bạn có những trải nghiệm mua sắm tuyệt vời tại Laptop Shop!</p>" +
            "    <p>Trân trọng,<br/><strong>Đội ngũ Laptop Shop</strong></p>" +
            "</div>",
            fullName, verifyUrl
        );

        sendHtmlEmail(to, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            helper.setText(htmlContent, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setFrom("laptopshop@gmail.com");

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
