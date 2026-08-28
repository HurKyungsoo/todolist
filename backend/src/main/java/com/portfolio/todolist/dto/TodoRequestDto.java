package com.portfolio.todolist.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class TodoRequestDto {

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    private String content;

    private LocalDateTime dueDate;

    private String category;

    public TodoRequestDto(String title, String content, LocalDateTime dueDate, String category) {
        this.title = title;
        this.content = content;
        this.dueDate = dueDate;
        this.category = category;
    }
}
