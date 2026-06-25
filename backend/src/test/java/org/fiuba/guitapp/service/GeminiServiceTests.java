package org.fiuba.guitapp.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.fiuba.guitapp.dto.MonthlyCategoryBreakdown;
import org.fiuba.guitapp.dto.MonthlyInsight;
import org.fiuba.guitapp.dto.MonthlySummaryResponse;
import org.fiuba.guitapp.dto.ReceiptAnalysisResponse;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.User;
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

    @Test
    void analyzeText_ShouldReturnResponse_WhenApiCallIsSuccessful() throws Exception {
        // Arrange
        String transcribedText = "Gasté 1500 pesos en restaurante Pizza Lunch";
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
        ReceiptAnalysisResponse response = geminiService.analyzeText(transcribedText);

        // Assert
        assertNotNull(response);
        assertEquals(0, new BigDecimal("1500.5").compareTo(response.amount()));
        assertEquals(ExpenseCategory.RESTAURANT, response.category());
        assertEquals("Pizza Lunch", response.title());
    }

    @Test
    void analyzeText_ShouldThrowAuthException_WhenApiFails() {
        // Arrange
        String transcribedText = "Gasté 1500 pesos";
        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenThrow(new RuntimeException("API error"));

        // Act & Assert
        org.junit.jupiter.api.Assertions.assertThrows(org.fiuba.guitapp.exception.AuthException.class, () -> {
            geminiService.analyzeText(transcribedText);
        });
    }

    @Test
    void generateMonthlySummary_ShouldReturnText_WhenApiCallIsSuccessful() {
        // Arrange
        User user = new User();
        user.setEmail("test@example.com");
        MonthlySummaryResponse summary = new MonthlySummaryResponse(
                2026,
                5,
                new BigDecimal("100000"),
                new BigDecimal("60000"),
                new BigDecimal("40000"),
                List.of(),
                List.of());

        String geminiResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "Este mes ahorraste bien. Seguí así."
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(geminiResponse);

        // Act
        String result = geminiService.generateMonthlySummary(summary, user);

        // Assert
        assertNotNull(result);
        assertEquals("Este mes ahorraste bien. Seguí así.", result);
    }

    @Test
    void generateMonthlySummary_ShouldThrowAuthException_WhenApiCallFails() {
        // Arrange
        User user = new User();
        user.setEmail("test@example.com");
        MonthlySummaryResponse summary = new MonthlySummaryResponse(
                2026,
                5,
                new BigDecimal("100000"),
                new BigDecimal("60000"),
                new BigDecimal("40000"),
                List.of(),
                List.of());

        when(restTemplate.postForObject(anyString(), any(), eq(String.class)))
                .thenThrow(new RuntimeException("API error"));

        // Act & Assert
        org.junit.jupiter.api.Assertions.assertThrows(org.fiuba.guitapp.exception.AuthException.class, () -> {
            geminiService.generateMonthlySummary(summary, user);
        });
    }

    @Test
    void generateMonthlySummary_ShouldBuildPromptWithCategoriesAndInsights() {
        User user = new User();
        user.setEmail("test@example.com");

        MonthlyCategoryBreakdown category = new MonthlyCategoryBreakdown(
                ExpenseCategory.DELIVERY, new BigDecimal("20000"), 33.3, 15.0);
        MonthlyInsight insight = new MonthlyInsight(
                "SPENDING", "Delivery", "33%", "del total", "negative", null);

        MonthlySummaryResponse summary = new MonthlySummaryResponse(
                2026, 5,
                new BigDecimal("100000"),
                new BigDecimal("60000"),
                new BigDecimal("40000"),
                List.of(category),
                List.of(insight));

        String geminiResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "• Delivery representó un tercio de tus gastos."
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(geminiResponse);

        String result = geminiService.generateMonthlySummary(summary, user);

        assertNotNull(result);
        assertEquals("• Delivery representó un tercio de tus gastos.", result);
    }

    @Test
    void generateMonthlySummary_ShouldBuildPromptWithInsightWithNullSub() {
        User user = new User();
        user.setEmail("test@example.com");

        MonthlyInsight insightNoSub = new MonthlyInsight(
                "SAVINGS", "Ahorraste", "40%", null, "positive", null);

        MonthlySummaryResponse summary = new MonthlySummaryResponse(
                2026, 5,
                new BigDecimal("100000"),
                new BigDecimal("60000"),
                new BigDecimal("40000"),
                List.of(),
                List.of(insightNoSub));

        String geminiResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "• Buen ahorro este mes."
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(geminiResponse);

        String result = geminiService.generateMonthlySummary(summary, user);

        assertNotNull(result);
        assertEquals("• Buen ahorro este mes.", result);
    }

    @Test
    void generateMonthlySummary_ShouldBuildPromptWithCategoryWithNullChange() {
        User user = new User();
        user.setEmail("test@example.com");

        MonthlyCategoryBreakdown categoryNoChange = new MonthlyCategoryBreakdown(
                ExpenseCategory.RENT, new BigDecimal("50000"), 50.0, null);

        MonthlySummaryResponse summary = new MonthlySummaryResponse(
                2026, 5,
                new BigDecimal("100000"),
                new BigDecimal("50000"),
                new BigDecimal("50000"),
                List.of(categoryNoChange),
                List.of());

        String geminiResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "• El alquiler se llevó la mitad de tus gastos."
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(geminiResponse);

        String result = geminiService.generateMonthlySummary(summary, user);

        assertNotNull(result);
        assertEquals("• El alquiler se llevó la mitad de tus gastos.", result);
    }

    @Test
    void analyzeText_ShouldHandleTextWithQuotes() {
        String transcribedText = "Gasté \"mil pesos\" en el \"súper\"";

        String geminiResponse = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          {
                            "text": "{\\"amount\\": 1000, \\"category\\": \\"SUPERMARKET\\", \\"title\\": \\"Súper\\"}"
                          }
                        ]
                      }
                    }
                  ]
                }
                """;

        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(geminiResponse);

        ReceiptAnalysisResponse response = geminiService.analyzeText(transcribedText);

        assertNotNull(response);
        assertEquals(ExpenseCategory.SUPERMARKET, response.category());
    }

    @Test
    void analyzeText_ShouldThrowAuthException_WhenResponseIsInvalidJson() {
        String transcribedText = "Gasté 500 en café";

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

        org.junit.jupiter.api.Assertions.assertThrows(org.fiuba.guitapp.exception.AuthException.class, () -> {
            geminiService.analyzeText(transcribedText);
        });
    }
}
