package com.portfolio.todolist.service;

import com.portfolio.todolist.dto.TodoRequestDto;
import com.portfolio.todolist.dto.TodoResponseDto;
import com.portfolio.todolist.dto.TodoStatsDto;
import com.portfolio.todolist.entity.Todo;
import com.portfolio.todolist.entity.User;
import com.portfolio.todolist.exception.AccessDeniedException;
import com.portfolio.todolist.exception.ResourceNotFoundException;
import com.portfolio.todolist.repository.TodoRepository;
import com.portfolio.todolist.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    @Transactional
    public TodoResponseDto createTodo(Long userId, TodoRequestDto request) {
        User user = findUser(userId);
        Todo todo = Todo.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .dueDate(request.getDueDate())
                .category(request.getCategory())
                .priority(request.getPriority())
                .recurrence(request.getRecurrence())
                .user(user)
                .build();
        Todo saved = todoRepository.save(todo);
        saved.setSortOrder(saved.getId()); // 새 항목은 수동 정렬에서 맨 아래
        return new TodoResponseDto(saved);
    }

    public Page<TodoResponseDto> getTodos(Long userId, String category, Boolean completed, String keyword, Pageable pageable) {
        return todoRepository
                .search(userId, blankToNull(category), completed, blankToNull(keyword), pageable)
                .map(TodoResponseDto::new);
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    public TodoStatsDto getStats(Long userId) {
        long total = todoRepository.countByUser_Id(userId);
        long completed = todoRepository.countByUser_IdAndCompleted(userId, true);
        long overdue = todoRepository.countOverdue(userId, java.time.LocalDateTime.now());
        return new TodoStatsDto(total, completed, overdue);
    }

    public List<String> getCategories(Long userId) {
        return todoRepository.findDistinctCategories(userId);
    }

    @Transactional
    public int clearCompleted(Long userId) {
        return todoRepository.deleteCompleted(userId);
    }

    // 드래그 정렬 결과를 반영 — ids 순서대로 sortOrder 재부여 (본인 항목만)
    @Transactional
    public void reorder(Long userId, List<Long> ids) {
        List<Todo> todos = todoRepository.findAllById(ids);
        java.util.Map<Long, Todo> byId = new java.util.HashMap<>();
        for (Todo t : todos) {
            if (t.isOwnedBy(userId)) byId.put(t.getId(), t);
        }
        long order = 0;
        for (Long id : ids) {
            Todo t = byId.get(id);
            if (t != null) t.setSortOrder(order++);
        }
    }

    public TodoResponseDto getTodo(Long userId, Long todoId) {
        Todo todo = findOwnedTodo(userId, todoId);
        return new TodoResponseDto(todo);
    }

    @Transactional
    public TodoResponseDto updateTodo(Long userId, Long todoId, TodoRequestDto request) {
        Todo todo = findOwnedTodo(userId, todoId);
        todo.update(request.getTitle(), request.getContent(), request.getDueDate(),
                request.getCategory(), request.getPriority(), request.getRecurrence());
        return new TodoResponseDto(todo);
    }

    @Transactional
    public TodoResponseDto toggleComplete(Long userId, Long todoId) {
        Todo todo = findOwnedTodo(userId, todoId);
        todo.toggleComplete();
        // 반복 항목을 완료하면 다음 회차를 새로 만든다
        if (todo.isCompleted() && todo.nextDueDate() != null) {
            Todo next = Todo.builder()
                    .title(todo.getTitle())
                    .content(todo.getContent())
                    .dueDate(todo.nextDueDate())
                    .category(todo.getCategory())
                    .priority(todo.getPriority())
                    .recurrence(todo.getRecurrence())
                    .user(todo.getUser())
                    .build();
            Todo saved = todoRepository.save(next);
            saved.setSortOrder(saved.getId());
        }
        return new TodoResponseDto(todo);
    }

    @Transactional
    public void deleteTodo(Long userId, Long todoId) {
        Todo todo = findOwnedTodo(userId, todoId);
        todoRepository.delete(todo);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다. id=" + userId));
    }

    private Todo findOwnedTodo(Long userId, Long todoId) {
        Todo todo = todoRepository.findById(todoId)
                .orElseThrow(() -> new ResourceNotFoundException("Todo를 찾을 수 없습니다. id=" + todoId));
        if (!todo.isOwnedBy(userId)) {
            throw new AccessDeniedException("본인의 Todo만 접근할 수 있습니다.");
        }
        return todo;
    }
}
