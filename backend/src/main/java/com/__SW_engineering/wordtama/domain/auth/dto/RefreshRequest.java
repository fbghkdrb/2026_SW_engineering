package com.__SW_engineering.wordtama.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class RefreshRequest {

    @NotBlank(message = "RefreshToken을 입력해주세요.")
    private String refreshToken;
}
