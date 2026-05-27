package org.fiuba.guitapp.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.stream.Collectors;

import org.fiuba.guitapp.dto.ReceiptAnalysisResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService(
            @Qualifier("geminiRestTemplate") RestTemplate restTemplate,
            ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public ReceiptAnalysisResponse analyzeReceipt(MultipartFile file) {
        try {
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            String mimeType = file.getContentType();
            LocalDate currentDate = LocalDate.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String formatedCurrentDate = currentDate.format(formatter);
            String categories = Arrays.stream(ExpenseCategory.values())
                    .map(Enum::name)
                    .collect(Collectors.joining(", "));

            String prompt = "Analyze this receipt image and extract the following information in JSON format: " +
                    "{" +
                    "\"date\": date (yyyy-MM-dd), " +
                    "\"amount\": number, " +
                    "\"category\": one of " + categories + ", " +
                    "\"description\": \"string (max 3 words)\"" +
                    "}. " +
                    "If a field cannot be determined, use null. " +
                    "If any part of the date cannot be determined, use current date information, for example, if year is missing use current year. The current date is "
                    + formatedCurrentDate + ". " +
                    "The amount should be a number (e.g. 1500.50) and has to be the total amount of the ticket." +
                    "The category must match exactly one of the provided values." +
                    "The description must specify over the category, for example, if category is RESTAURANT, the description must include something related to RESTAURANT like \"Breakfast\", \"Coffee\", \"Lunch\", \"Dinner\". Description must be in spanish. "
                    +
                    "CRITICAL: Only return the JSON.";

            String jsonPayload = String.format("""
                    {
                      "contents": [
                        {
                          "parts": [
                            { "text": "%s" },
                            {
                              "inlineData": {
                                "mimeType": "%s",
                                "data": "%s"
                              }
                            }
                          ]
                        }
                      ]
                    }
                    """,
                    prompt.replace("\"", "\\\""),
                    mimeType,
                    base64Image);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> requestEntity = new HttpEntity<>(jsonPayload, headers);
            String urlWithKey = apiUrl + "?key=" + apiKey;
            String response = restTemplate.postForObject(urlWithKey, requestEntity, String.class);

            return parseGeminiResponse(response);
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            throw new AuthException(ErrorCode.UNKNOWN_ERROR, "Error analyzing receipt with Gemini");
        }
    }

    private ReceiptAnalysisResponse parseGeminiResponse(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        String jsonContent = root.path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();

        if (jsonContent.startsWith("```")) {
            jsonContent = jsonContent.replace("```json", "")
                    .replace("```JSON", "")
                    .replace("```", "");
        }

        return objectMapper.readValue(jsonContent, ReceiptAnalysisResponse.class);
    }
}
