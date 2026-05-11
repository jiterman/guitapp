package org.fiuba.guitapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final Logger log = LoggerFactory.getLogger(EmailService.class);

    public void sendRegistrationOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Bienvenido a GuitApp - Verifica tu cuenta");
        message.setText("¡Hola!\n\n" + "Estamos muy emocionados de que te unas a GuitApp. "
                + "Para comenzar a simplificar tus finanzas, por favor utiliza el siguiente código de verificación:\n\n"
                + otp + "\n\n" + "Este código expirará en 10 minutos.\n\n" + "¡Saludos,\n" + "El equipo de GuitApp");

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.warn("Failed to send registration email to {}: {}. Continuing without failing registration.", to,
                    ex.getMessage());
        }
        log.info("Registration OTP for {}: {}", to, otp);
    }

    public void sendResetPasswordOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("GuitApp - Recupera tu contraseña");
        message.setText("¡Hola!\n\n" + "Recibimos una solicitud para restablecer tu contraseña en GuitApp. "
                + "Utiliza el siguiente código para continuar con el proceso:\n\n"
                + otp + "\n\n" + "Este código expirará en 10 minutos.\n\n"
                + "Si no solicitaste este cambio, puedes ignorar este correo.\n\n" + "¡Saludos,\n"
                + "El equipo de GuitApp");

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.warn("Failed to send reset password email to {}: {}. Continuing without failing.", to,
                    ex.getMessage());
        }
        log.info("Reset password OTP for {}: {}", to, otp);
    }

    public void sendEmailChangeOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("GuitApp - Confirma tu nuevo correo electrónico");
        message.setText("¡Hola!\n\n" + "Recibimos una solicitud para cambiar tu correo electrónico en GuitApp. "
                + "Para completar este cambio, por favor utiliza el siguiente código de verificación:\n\n"
                + otp + "\n\n" + "Este código expirará en 10 minutos.\n\n"
                + "Si no solicitaste este cambio, por favor ignora este correo.\n\n" + "¡Saludos,\n"
                + "El equipo de GuitApp");

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.warn("Failed to send email change OTP to {}: {}. Continuing without failing.", to,
                    ex.getMessage());
        }
        log.info("Email change OTP for {}: {}", to, otp);
    }
}
