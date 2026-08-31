package com.portfolio.todolist.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class TodoRequestDto {

    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 200, message = "제목은 200자 이하여야 합니다.")
    private String title;

    private String content;

    private LocalDateTime dueDate;

    @Size(max = 50, message = "카테고리는 50자 이하여야 합니다.")
    private String category;

    // 0=낮음, 1=보통, 2=높음. 미지정 시 서버에서 보통(1)으로 처리.
    @Min(value = 0, message = "우선순위 값이 올바르지 않습니다.")
    @Max(value = 2, message = "우선순위 값이 올바르지 않습니다.")
    private Integer priority;

    // null | DAILY | WEEKLY | MONTHLY
    private String recurrence;

    public TodoRequestDto(String title, String content, LocalDateTime dueDate, String category,
                          Integer priority, String recurrence) {
        this.title = title;
        this.content = content;
        this.dueDate = dueDate;
        this.category = category;
        this.priority = priority;
        this.recurrence = recurrence;
    }
}
