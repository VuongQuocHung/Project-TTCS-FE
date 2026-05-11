package com.laptopshop.controller.pub;

import com.laptopshop.dto.AiChatRequest;
import com.laptopshop.dto.AiChatResponse;
import com.laptopshop.service.AiChatService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/ai")
@RequiredArgsConstructor
@Tag(name = "AI Chat", description = "Chatbot goi y san pham")
public class PublicAiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/chat")
    public AiChatResponse chat(@RequestBody AiChatRequest request) {
        return aiChatService.chat(request);
    }
}
