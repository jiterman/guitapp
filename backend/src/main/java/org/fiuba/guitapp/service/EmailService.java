package org.fiuba.guitapp.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendRegistrationOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Bienvenido a GuitApp - Verifica tu cuenta");
        message.setText("¡Hola!\n\n" + "Estamos muy emocionados de que te unas a GuitApp. "
                + "Para comenzar a simplificar tus finanzas, por favor utiliza el siguiente código de verificación:\n\n"
                + otp + "\n\n" + "Este código expirará en 10 minutos.\n\n" + "¡Saludos,\n" + "El equipo de GuitApp");

        mailSender.send(message);
    }
}
