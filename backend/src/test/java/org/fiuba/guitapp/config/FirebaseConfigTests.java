package org.fiuba.guitapp.config;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class FirebaseConfigTests {

    @InjectMocks
    private FirebaseConfig firebaseConfig;

    @Test
    void initialize_ShouldDoNothing_WhenConfigPathIsNull() {
        ReflectionTestUtils.setField(firebaseConfig, "configPath", null);

        firebaseConfig.initialize();

        // No exception should be thrown, and nothing should happen
    }

    @Test
    void initialize_ShouldDoNothing_WhenConfigPathIsEmpty() {
        ReflectionTestUtils.setField(firebaseConfig, "configPath", "");

        firebaseConfig.initialize();

        // No exception should be thrown
    }

    @Test
    void initialize_ShouldDoNothing_WhenFileDoesNotExist() {
        ReflectionTestUtils.setField(firebaseConfig, "configPath", "non-existent-file.json");

        firebaseConfig.initialize();

        // No exception should be thrown
    }
}
