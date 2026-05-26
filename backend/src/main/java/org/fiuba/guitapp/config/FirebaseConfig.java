package org.fiuba.guitapp.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.path}")
    private String configPath;

    @PostConstruct
    public void initialize() {
        if (configPath == null || configPath.isEmpty()) {
            log.warn("Firebase config path is not set. Notifications will be disabled.");
            return;
        }

        File configFile = new File(configPath);
        if (!configFile.exists()) {
            log.warn("Firebase config file not found at path: {}. Notifications will be disabled.", configPath);
            return;
        }

        try (FileInputStream serviceAccount = new FileInputStream(configFile)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                log.info("Firebase has been initialized");
            }
        } catch (IOException e) {
            log.error("Error initializing Firebase. Notifications will be disabled.", e);
        }
    }
}
