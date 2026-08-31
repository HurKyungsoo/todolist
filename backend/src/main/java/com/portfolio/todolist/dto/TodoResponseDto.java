package com.portfolio.todolist.dto;

import com.portfolio.todolist.entity.Todo;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Getter
public class TodoResponseDto {

    private final Long id;
    private final String title;
    private final String content;
    private final LocalDateTime dueDate;
    private final boolean completed;
    private final String category;
    private final int priority; // 0=낮음, 1=보통, 2=높음
    private final String recurrence; // null | DAILY | WEEKLY | MONTHLY
    private final long sortOrder;
    private final boolean dueSoon; // 마감 24시간 이내 && 미완료
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public TodoResponseDto(Todo todo) {
        this.id = todo.getId();
        this.title = todo.getTitle();
        this.content = todo.getContent();
        this.dueDate = todo.getDueDate();
        this.completed = todo.isCompleted();
        this.category = todo.getCategory();
        this.priority = todo.getPriority();
        this.recurrence = todo.getRecurrence();
        this.sortOrder = todo.getSortOrder();
        this.dueSoon = calculateDueSoon(todo);
        this.createdAt = todo.getCreatedAt();
        this.updatedAt = todo.getUpdatedAt();
    }

    private boolean calculateDueSoon(Todo todo) {
        if (todo.isCompleted() || todo.getDueDate() == null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        long hoursLeft = ChronoUnit.HOURS.between(now, todo.getDueDate());
        return hoursLeft >= 0 && hoursLeft <= 24;
    }
}
