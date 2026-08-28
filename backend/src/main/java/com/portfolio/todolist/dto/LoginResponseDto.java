package com.portfolio.todolist.dto;

import lombok.Getter;

@Getter
public class LoginResponseDto {

    private final String token;
    private final String tokenType = "Bearer";
    private final Long userId;
    private final String username;

    public LoginResponseDto(String token, Long userId, String username) {
        this.token = token;
        this.userId = userId;
        this.username = username;
    }
}
