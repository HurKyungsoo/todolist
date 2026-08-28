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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder
    public Todo(String title, String content, LocalDateTime dueDate, String category, User user) {
        this.title = title;
        this.content = content;
        this.dueDate = dueDate;
        this.category = category;
        this.user = user;
        this.completed = false;
    }

    public void update(String title, String content, LocalDateTime dueDate, String category) {
        this.title = title;
        this.content = content;
        this.dueDate = dueDate;
        this.category = category;
    }

    public void toggleComplete() {
        this.completed = !this.completed;
    }

    public boolean isOwnedBy(Long userId) {
        return this.user.getId().equals(userId);
    }
}
