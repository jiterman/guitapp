package org.fiuba.guitapp.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import org.fiuba.guitapp.dto.MonthlyCategoryBreakdown;
import org.fiuba.guitapp.dto.MonthlyInsight;
import org.fiuba.guitapp.dto.MonthlySummaryResponse;
import org.fiuba.guitapp.dto.ReceiptAnalysisResponse;
import org.fiuba.guitapp.exception.AuthException;
import org.fiuba.guitapp.exception.ErrorCode;
import org.fiuba.guitapp.model.ExpenseCategory;
import org.fiuba.guitapp.model.User;
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
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

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
            LocalDate currentDate = LocalDate.now(ZoneId.of("America/Argentina/Buenos_Aires"));
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
                    "\"title\": \"string (max 3 words, max 20 chars)\"" +
                    "}. " +
                    "If a field cannot be determined, use null. " +
                    "If any part of the date cannot be determined, use current date information, for example, if year is missing use current year. The current date is "
                    + formatedCurrentDate + ". " +
                    "The amount should be a number (e.g. 1500.50) and has to be the total amount of the ticket." +
                    "The category must match exactly one of the provided values." +
                    "The title must specify over the category, for example, if category is RESTAURANT, the title must include something related to RESTAURANT like \"Almuerzo\", \"Cafe\", \"Cena\". Title must be in spanish and max 20 characters. "
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

    public ReceiptAnalysisResponse analyzeText(String transcribedText) {
        try {
            LocalDate currentDate = LocalDate.now(ZoneId.of("America/Argentina/Buenos_Aires"));
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String formatedCurrentDate = currentDate.format(formatter);
            String categories = Arrays.stream(ExpenseCategory.values())
                    .map(Enum::name)
                    .collect(Collectors.joining(", "));

            String prompt = "Analyze this transcribed audio text of an expense description and extract the following information in JSON format: " +
                    "{" +
                    "\"date\": date (yyyy-MM-dd), " +
                    "\"amount\": number, " +
                    "\"category\": one of [" + categories + "], " +
                    "\"title\": \"string (max 3 words, max 20 chars)\"" +
                    "}. " +
                    "If a field cannot be determined, use null. " +
                    "If any part of the date cannot be determined, use current date information, for example, if year is missing use current year. The current date is "
                    + formatedCurrentDate + ". " +
                    "The amount should be a number (e.g. 1500.50) and has to be the total amount spoken or implied in the text. " +
                    "The category must match exactly one of the provided values." +
                    "The title must specify over the category, for example, if category is RESTAURANT, the title must include something related to RESTAURANT like \"Almuerzo\", \"Cafe\", \"Cena\". Title must be in spanish and max 20 characters. "
                    +
                    "Text to analyze: \"" + transcribedText.replace("\"", "\\\"") + "\". " +
                    "CRITICAL: Only return the JSON.";

            String jsonPayload = String.format("""
                    {
                      "contents": [
                        {
                          "parts": [
                            { "text": "%s" }
                          ]
                        }
                      ]
                    }
                    """,
                    prompt.replace("\"", "\\\""));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> requestEntity = new HttpEntity<>(jsonPayload, headers);
            String urlWithKey = apiUrl + "?key=" + apiKey;
            String response = restTemplate.postForObject(urlWithKey, requestEntity, String.class);

            return parseGeminiResponse(response);
        } catch (Exception e) {
            log.error("Error calling Gemini API for text analysis", e);
            throw new AuthException(ErrorCode.UNKNOWN_ERROR, "Error analyzing text with Gemini");
        }
    }

    public String generateMonthlySummary(MonthlySummaryResponse summary, User user) {
        try {
            String prompt = buildMonthlySummaryPrompt(summary, user);

            ObjectNode payload = objectMapper.createObjectNode();
            ArrayNode contents = payload.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            parts.addObject().put("text", prompt);

            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> requestEntity = new HttpEntity<>(jsonPayload, headers);
            String urlWithKey = apiUrl + "?key=" + apiKey;
            String response = restTemplate.postForObject(urlWithKey, requestEntity, String.class);

            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        } catch (Exception e) {
            log.error("Error calling Gemini API for monthly summary generation", e);
            throw new AuthException(ErrorCode.UNKNOWN_ERROR, "Error generating AI summary with Gemini");
        }
    }

    private String buildMonthlySummaryPrompt(MonthlySummaryResponse summary, User user) {
        StringBuilder sb = new StringBuilder();
        sb.append("Sos un asistente financiero personal. ");
        sb.append("Escribí en español rioplatense, tono amigable y directo.\n\n");
        sb.append("Analizá los datos del mes ").append(summary.month()).append("/").append(summary.year());
        sb.append(" y generá entre 4 y 6 bullets que aporten valor real al usuario.\n\n");
        sb.append("Qué hacer:\n");
        sb.append("- Cruzar categorías entre sí: ej. si el gasto en salidas + delivery + restaurante juntos suman un % alto, mencionarlo.\n");
        sb.append("- Comparar el peso de gastos discrecionales vs esenciales sobre el total.\n");
        sb.append("- Si hay categorías con variación grande respecto al mes anterior, señalar cuánto representa eso en plata.\n");
        sb.append("- Dar un tip concreto y accionable cuando aplique (solo para categorías no esenciales).\n");
        sb.append("- Usá **negrita** para categorías, montos y porcentajes relevantes.\n\n");
        sb.append("Qué NO hacer:\n");
        sb.append("- No repetir lo que ya dicen los insights (listados abajo).\n");
        sb.append("- No especular sobre causas: no digas por qué subió o bajó algo.\n");
        sb.append("- No sugerir reducir gastos esenciales (Alquiler, Expensas, Supermercado, Servicios, Médico, Farmacia, Educación, Transporte público).\n");
        sb.append("- Sin intro, sin conclusión, sin frases genéricas como 'es importante revisar tus gastos'.\n\n");
        sb.append("Datos del mes:\n");
        sb.append("- Ingresos: $").append(summary.totalIncome()).append("\n");
        sb.append("- Gastos: $").append(summary.totalExpenses()).append("\n");
        sb.append("- Balance: $").append(summary.balance()).append("\n");

        List<MonthlyCategoryBreakdown> categories = summary.categoryBreakdown() == null
                ? List.of()
                : summary.categoryBreakdown();
        if (!categories.isEmpty()) {
            sb.append("\nDesglose por categoría (ordenado por monto):\n");
            for (MonthlyCategoryBreakdown c : categories) {
                sb.append("- ")
                        .append(c.category().getDisplayName())
                        .append(": $")
                        .append(c.totalAmount())
                        .append(" (")
                        .append(c.percentage() == null ? 0.0 : c.percentage())
                        .append("% del total");
                if (c.changeVsPreviousMonth() != null) {
                    sb.append(", cambio vs mes anterior: ")
                            .append(c.changeVsPreviousMonth() > 0 ? "+" : "")
                            .append(c.changeVsPreviousMonth())
                            .append("%");
                }
                sb.append(")\n");
            }
        }

        List<MonthlyInsight> insights = summary.insights() == null ? List.of() : summary.insights();
        if (!insights.isEmpty()) {
            sb.append("\nInsights ya mostrados al usuario (NO repetir, usarlos solo como contexto):\n");
            for (MonthlyInsight i : insights) {
                sb.append("- ")
                        .append(i.label())
                        .append(": ")
                        .append(i.highlight())
                        .append(i.sub() == null ? "" : " " + i.sub())
                        .append("\n");
            }
        }

        sb.append("\nDevolvé solo los bullets, usando • como separador. Nada más.");
        return sb.toString();
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
