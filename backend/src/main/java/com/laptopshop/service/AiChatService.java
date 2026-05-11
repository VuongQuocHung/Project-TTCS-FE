package com.laptopshop.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.laptopshop.dto.AiChatRequest;
import com.laptopshop.dto.AiChatResponse;
import com.laptopshop.dto.AiProductSuggestion;
import com.laptopshop.entity.Product;
import com.laptopshop.repository.ProductRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private static final int DEFAULT_LIMIT = 5;
    private static final int MAX_LIMIT = 10;

    private final ProductRepository productRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${app.ai.gemini.key:}")
    private String geminiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Transactional(readOnly = true)
    public AiChatResponse chat(AiChatRequest request) {
        if (request == null || !StringUtils.hasText(request.getMessage())) {
            throw new ResponseStatusException(BAD_REQUEST, "Message is required");
        }
        if (!StringUtils.hasText(geminiKey)) {
            throw new ResponseStatusException(BAD_REQUEST, "GEMINI_KEY is not configured");
        }

        int limit = resolveLimit(request.getLimit());
        List<Product> products = productRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "id"))
        ).getContent();

        List<AiProductSuggestion> suggestions = toSuggestions(products);
        String prompt = buildPrompt(request.getMessage().trim(), suggestions);

        GeminiResponse response = webClientBuilder.build()
                .post()
                .uri("https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
                        geminiModel, geminiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of(
                        "contents", List.of(
                                Map.of(
                                        "role", "user",
                                        "parts", List.of(Map.of("text", prompt))
                                )
                        )
                ))
                .retrieve()
                .bodyToMono(GeminiResponse.class)
                .block(Duration.ofSeconds(20));

        String reply = response != null ? response.firstText() : "";
        return AiChatResponse.builder()
                .reply(reply != null ? reply : "")
                .suggestions(suggestions)
                .build();
    }

    private int resolveLimit(Integer requested) {
        if (requested == null || requested <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(requested, MAX_LIMIT);
    }

    private List<AiProductSuggestion> toSuggestions(List<Product> products) {
        List<AiProductSuggestion> results = new ArrayList<>();
        for (Product product : products) {
            String brandName = product.getBrand() != null ? product.getBrand().getName() : null;
            String categoryName = product.getCategory() != null ? product.getCategory().getName() : null;
            results.add(AiProductSuggestion.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .brandName(brandName)
                    .categoryName(categoryName)
                    .build());
        }
        return results;
    }

    private String buildPrompt(String message, List<AiProductSuggestion> suggestions) {
        StringBuilder builder = new StringBuilder();
        builder.append("You are a laptop shop assistant. Answer in Vietnamese.\n");
        builder.append("Suggest suitable products from the list when relevant.\n\n");
        builder.append("Available products:\n");
        for (AiProductSuggestion item : suggestions) {
            builder.append("- id: ").append(item.getId())
                    .append(", name: ").append(item.getName());
            if (StringUtils.hasText(item.getBrandName())) {
                builder.append(", brand: ").append(item.getBrandName());
            }
            if (StringUtils.hasText(item.getCategoryName())) {
                builder.append(", category: ").append(item.getCategoryName());
            }
            builder.append("\n");
        }
        builder.append("\nUser question: ").append(message).append("\n");
        builder.append("Provide a concise helpful answer and include product ids if you recommend any.");
        return builder.toString();
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class GeminiResponse {
        private List<Candidate> candidates;

        String firstText() {
            if (candidates == null || candidates.isEmpty()) {
                return "";
            }
            Candidate candidate = candidates.get(0);
            if (candidate == null || candidate.content == null || candidate.content.parts == null) {
                return "";
            }
            for (Part part : candidate.content.parts) {
                if (part != null && StringUtils.hasText(part.text)) {
                    return part.text;
                }
            }
            return "";
        }
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Candidate {
        private Content content;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Content {
        private List<Part> parts;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Part {
        private String text;
    }
}
