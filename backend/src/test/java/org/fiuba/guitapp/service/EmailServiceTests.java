package org.fiuba.guitapp.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@ExtendWith(MockitoExtension.class)
class EmailServiceTests {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void shouldSendRegistrationOtpEmail() {
        String to = "user@example.com";
        String otp = "123456";

        emailService.sendRegistrationOtp(to, otp);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void shouldSendResetPasswordOtpEmail() {
        String to = "user@example.com";
        String otp = "123456";

        emailService.sendResetPasswordOtp(to, otp);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void shouldSendEmailChangeOtpEmail() {
        String to = "user@example.com";
        String otp = "123456";

        emailService.sendEmailChangeOtp(to, otp);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void shouldHandleMailExceptionInSendRegistrationOtp() {
        String to = "user@example.com";
        String otp = "123456";
        org.mockito.Mockito.doThrow(new org.springframework.mail.MailSendException("error"))
                .when(mailSender)
                .send(any(SimpleMailMessage.class));

        emailService.sendRegistrationOtp(to, otp);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void shouldHandleMailExceptionInSendResetPasswordOtp() {
        String to = "user@example.com";
        String otp = "123456";
        org.mockito.Mockito.doThrow(new org.springframework.mail.MailSendException("error"))
                .when(mailSender)
                .send(any(SimpleMailMessage.class));

        emailService.sendResetPasswordOtp(to, otp);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void shouldHandleMailExceptionInSendEmailChangeOtp() {
        String to = "user@example.com";
        String otp = "123456";
        org.mockito.Mockito.doThrow(new org.springframework.mail.MailSendException("error"))
                .when(mailSender)
                .send(any(SimpleMailMessage.class));

        emailService.sendEmailChangeOtp(to, otp);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void shouldSendAlertEmailWithSameSubjectAndBody() {
        String to = "user@example.com";
        String subject = "Se nos fue la mano";
        String body = "Te pasaste de tu presupuesto de gastos fijos.";

        emailService.sendAlertEmail(to, subject, body);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage message = captor.getValue();
        org.junit.jupiter.api.Assertions.assertEquals(to, message.getTo()[0]);
        org.junit.jupiter.api.Assertions.assertEquals(subject, message.getSubject());
        org.junit.jupiter.api.Assertions.assertEquals(body, message.getText());
    }

    @Test
    void shouldHandleMailExceptionInSendAlertEmail() {
        String to = "user@example.com";
        String subject = "Alert";
        String body = "Body";
        org.mockito.Mockito.doThrow(new org.springframework.mail.MailSendException("error"))
                .when(mailSender)
                .send(any(SimpleMailMessage.class));

        emailService.sendAlertEmail(to, subject, body);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }
}
