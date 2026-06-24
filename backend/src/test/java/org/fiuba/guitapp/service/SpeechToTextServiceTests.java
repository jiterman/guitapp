package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import org.fiuba.guitapp.exception.AuthException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class SpeechToTextServiceTests {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private MultipartFile multipartFile;

    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private SpeechToTextService speechToTextService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(speechToTextService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(speechToTextService, "apiUrl", "http://test-api-url");
        ReflectionTestUtils.setField(speechToTextService, "objectMapper", objectMapper);
    }

    @Test
    void transcribeAudio_ShouldReturnTranscript_WhenApiCallIsSuccessful() throws Exception {
        // Arrange
        byte[] content = "test audio content".getBytes();
        when(multipartFile.getBytes()).thenReturn(content);
        lenient().when(multipartFile.getOriginalFilename()).thenReturn("audio.wav");

        String groqResponse = """
                {
                  "text": "gasto de 500 pesos en taxi"
                }
                """;

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(groqResponse);

        // Act
        String result = speechToTextService.transcribeAudio(multipartFile);

        // Assert
        assertEquals("gasto de 500 pesos en taxi", result);
    }

    @Test
    void transcribeAudio_ShouldReturnEmptyString_WhenNoTextInResponse() throws Exception {
        // Arrange
        byte[] content = "silent audio".getBytes();
        when(multipartFile.getBytes()).thenReturn(content);
        lenient().when(multipartFile.getOriginalFilename()).thenReturn("silent.wav");

        String groqResponse = "{}";

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(groqResponse);

        // Act
        String result = speechToTextService.transcribeAudio(multipartFile);

        // Assert
        assertEquals("", result);
    }

    @Test
    void transcribeAudio_ShouldThrowAuthException_WhenApiFails() throws Exception {
        // Arrange
        when(multipartFile.getBytes()).thenThrow(new RuntimeException("IO Exception"));

        // Act & Assert
        assertThrows(AuthException.class, () -> speechToTextService.transcribeAudio(multipartFile));
    }
}
