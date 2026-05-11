package com.laptopshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiProductSuggestion {
    private Long id;
    private String name;
    private String brandName;
    private String categoryName;
}
