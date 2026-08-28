package com.portfolio.todolist.service;

import com.portfolio.todolist.dto.TodoRequestDto;
import com.portfolio.todolist.dto.TodoResponseDto;
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
                .user(user)
                .build();
        return new TodoResponseDto(todoRepository.save(todo));
    }

    public Page<TodoResponseDto> getTodos(Long userId, String category, Boolean completed, Pageable pageable) {
        Page<Todo> page;
        if (category != null && !category.isBlank() && completed != null) {
            page = todoRepository.findByUser_IdAndCategoryContainingAndCompleted(userId, category, completed, pageable);
        } else if (category != null && !category.isBlank()) {
            page = todoRepository.findByUser_IdAndCategoryContaining(userId, category, pageable);
        } else if (completed != null) {
            page = todoRepository.findByUser_IdAndCompleted(userId, completed, pageable);
        } else {
            page = todoRepository.findByUser_Id(userId, pageable);
        }
        return page.map(TodoResponseDto::new);
    }

    public TodoResponseDto getTodo(Long userId, Long todoId) {
        Todo todo = findOwnedTodo(userId, todoId);
        return new TodoResponseDto(todo);
    }

    @Transactional
    public TodoResponseDto updateTodo(Long userId, Long todoId, TodoRequestDto request) {
        Todo todo = findOwnedTodo(userId, todoId);
        todo.update(request.getTitle(), request.getContent(), request.getDueDate(), request.getCategory());
        return new TodoResponseDto(todo);
    }

    @Transactional
    public TodoResponseDto toggleComplete(Long userId, Long todoId) {
        Todo todo = findOwnedTodo(userId, todoId);
        todo.toggleComplete();
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
