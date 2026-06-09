package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;

import org.fiuba.guitapp.dto.ReceiptAnalysisResponse;
import org.fiuba.guitapp.model.ExpenseCategory;
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
class GeminiServiceTests {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private MultipartFile multipartFile;

    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private GeminiService geminiService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(geminiService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(geminiService, "apiUrl", "http://test-api-url");
        ReflectionTestUtils.setField(geminiService, "objectMapper", objectMapper);
    }

    @Test
    void analyzeReceipt_ShouldReturnResponse_WhenApiCallIsSuccessful() throws Exception {
        // Arrange
        byte[] content = "test image content".getBytes();
        when(multipartFile.getBytes()).thenReturn(content);
        when(multipartFile.getContentType()).thenReturn("image/jpeg");

        String geminiResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "{\\"amount\\": 1500.50, \\"category\\": \\"RESTAURANT\\", \\"title\\": \\"Pizza Lunch\\"}"
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(geminiResponse);

        // Act
        ReceiptAnalysisResponse response = geminiService.analyzeReceipt(multipartFile);

        // Assert
        assertNotNull(response);
        assertEquals(0, new BigDecimal("1500.5").compareTo(response.amount()));
        assertEquals(ExpenseCategory.RESTAURANT, response.category());
        assertEquals("Pizza Lunch", response.title());
    }

    @Test
    void analyzeReceipt_ShouldHandleMarkdownResponse_WhenApiReturnsWrappedJson() throws Exception {
        // Arrange
        byte[] content = "test image content".getBytes();
        when(multipartFile.getBytes()).thenReturn(content);
        when(multipartFile.getContentType()).thenReturn("image/jpeg");

        String geminiResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "```json\\n{\\"amount\\": 1500.50, \\"category\\": \\"RESTAURANT\\", \\"title\\": \\"Pizza Lunch\\"}\\n```"
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(geminiResponse);

        // Act
        ReceiptAnalysisResponse response = geminiService.analyzeReceipt(multipartFile);

        // Assert
        assertNotNull(response);
        assertEquals(0, new BigDecimal("1500.5").compareTo(response.amount()));
        assertEquals(ExpenseCategory.RESTAURANT, response.category());
    }

    @Test
    void analyzeReceipt_ShouldHandleUppercaseMarkdownResponse_WhenApiReturnsWrappedJson() throws Exception {
        // Arrange
        byte[] content = "test image content".getBytes();
        when(multipartFile.getBytes()).thenReturn(content);
        when(multipartFile.getContentType()).thenReturn("image/jpeg");

        String geminiResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "```JSON\\n{\\"amount\\": 1500.50, \\"category\\": \\"RESTAURANT\\", \\"title\\": \\"Pizza Lunch\\"}\\n```"
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(geminiResponse);

        // Act
        ReceiptAnalysisResponse response = geminiService.analyzeReceipt(multipartFile);

        // Assert
        assertNotNull(response);
        assertEquals(0, new BigDecimal("1500.5").compareTo(response.amount()));
        assertEquals(ExpenseCategory.RESTAURANT, response.category());
    }

    @Test
    void analyzeReceipt_ShouldThrowAuthException_WhenApiCallFails() throws Exception {
        // Arrange
        byte[] content = "test image content".getBytes();
        when(multipartFile.getBytes()).thenReturn(content);
        when(multipartFile.getContentType()).thenReturn("image/jpeg");

        when(restTemplate.postForObject(anyString(), any(), eq(String.class)))
                .thenThrow(new RuntimeException("API error"));

        // Act & Assert
        org.junit.jupiter.api.Assertions.assertThrows(org.fiuba.guitapp.exception.AuthException.class, () -> {
            geminiService.analyzeReceipt(multipartFile);
        });
    }

    @Test
    void analyzeReceipt_ShouldThrowAuthException_WhenFileReadFails() throws Exception {
        // Arrange
        when(multipartFile.getBytes()).thenThrow(new java.io.IOException("File read error"));

        // Act & Assert
        org.junit.jupiter.api.Assertions.assertThrows(org.fiuba.guitapp.exception.AuthException.class, () -> {
            geminiService.analyzeReceipt(multipartFile);
        });
    }

    @Test
    void analyzeReceipt_ShouldThrowAuthException_WhenResponseIsInvalidJson() throws Exception {
        // Arrange
        byte[] content = "test image content".getBytes();
        when(multipartFile.getBytes()).thenReturn(content);
        when(multipartFile.getContentType()).thenReturn("image/jpeg");

        String geminiResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "invalid json"
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(geminiResponse);

        // Act & Assert
        org.junit.jupiter.api.Assertions.assertThrows(org.fiuba.guitapp.exception.AuthException.class, () -> {
            geminiService.analyzeReceipt(multipartFile);
        });
    }

    @Test
    void analyzeReceipt_ShouldThrowAuthException_WhenCandidatesAreEmpty() throws Exception {
        // Arrange
        byte[] content = "test image content".getBytes();
        when(multipartFile.getBytes()).thenReturn(content);
        when(multipartFile.getContentType()).thenReturn("image/jpeg");

        String geminiResponse = """
                {
                  "candidates": []
                }
                """;

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(geminiResponse);

        // Act & Assert
        org.junit.jupiter.api.Assertions.assertThrows(org.fiuba.guitapp.exception.AuthException.class, () -> {
            geminiService.analyzeReceipt(multipartFile);
        });
    }
}
