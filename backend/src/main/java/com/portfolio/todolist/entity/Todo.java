package com.portfolio.todolist.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "todos")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Todo extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    private String content;

    private LocalDateTime dueDate;

    @Column(nullable = false)
    private boolean completed;

    @Column(length = 50)
    private String category;

    // 우선순위: 0=낮음, 1=보통, 2=높음
    @Column(nullable = false, columnDefinition = "integer default 1")
    private int priority;

    // 반복: null | DAILY | WEEKLY | MONTHLY
    @Column(length = 10)
    private String recurrence;

    // 사용자 수동 정렬 순서 (작을수록 위)
    @Column(nullable = false, columnDefinition = "bigint default 0")
    private long sortOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder
    public Todo(String title, String content, LocalDateTime dueDate, String category,
                Integer priority, String recurrence, User user) {
        this.title = title;
        this.content = content;
        this.dueDate = dueDate;
        this.category = category;
        this.priority = normalizePriority(priority);
        this.recurrence = normalizeRecurrence(recurrence);
        this.user = user;
        this.completed = false;
    }

    public void update(String title, String content, LocalDateTime dueDate, String category,
                       Integer priority, String recurrence) {
        this.title = title;
        this.content = content;
        this.dueDate = dueDate;
        this.category = category;
        this.priority = normalizePriority(priority);
        this.recurrence = normalizeRecurrence(recurrence);
    }

    public void setSortOrder(long sortOrder) {
        this.sortOrder = sortOrder;
    }

    private static int normalizePriority(Integer priority) {
        if (priority == null) return 1;
        return Math.max(0, Math.min(2, priority));
    }

    private static String normalizeRecurrence(String recurrence) {
        if (recurrence == null) return null;
        return switch (recurrence) {
            case "DAILY", "WEEKLY", "MONTHLY" -> recurrence;
            default -> null;
        };
    }

    // 반복 항목 완료 시 만들 다음 회차의 마감일 (반복·마감일이 없으면 null)
    public LocalDateTime nextDueDate() {
        if (recurrence == null || dueDate == null) return null;
        return switch (recurrence) {
            case "DAILY" -> dueDate.plusDays(1);
            case "WEEKLY" -> dueDate.plusWeeks(1);
            case "MONTHLY" -> dueDate.plusMonths(1);
            default -> null;
        };
    }

    public void toggleComplete() {
        this.completed = !this.completed;
    }

    public boolean isOwnedBy(Long userId) {
        return this.user.getId().equals(userId);
    }
}
