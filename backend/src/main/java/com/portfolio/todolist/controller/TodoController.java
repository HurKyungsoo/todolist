package com.portfolio.todolist.controller;

import com.portfolio.todolist.dto.ReorderRequestDto;
import com.portfolio.todolist.dto.TodoRequestDto;
import com.portfolio.todolist.dto.TodoResponseDto;
import com.portfolio.todolist.dto.TodoStatsDto;
import com.portfolio.todolist.security.CustomUserDetails;
import com.portfolio.todolist.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * userId는 JWT 인증 정보(@AuthenticationPrincipal)에서 추출한다.
 * 요청 본인 소유 여부는 TodoService.findOwnedTodo에서 재검증한다.
 */
@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    // 정렬 허용 필드 화이트리스트 (그 외 값은 무시하고 기본 정렬 적용 → PropertyReferenceException 방지)
    private static final Set<String> SORTABLE = Set.of(
            "id", "title", "dueDate", "completed", "category", "priority", "sortOrder", "createdAt", "updatedAt");
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.ASC, "dueDate");

    private final TodoService todoService;

    @PostMapping
    public ResponseEntity<TodoResponseDto> createTodo(@AuthenticationPrincipal CustomUserDetails principal,
                                                        @Valid @RequestBody TodoRequestDto request) {
        TodoResponseDto response = todoService.createTodo(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<TodoResponseDto>> getTodos(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 10, sort = "dueDate") Pageable pageable) {
        return ResponseEntity.ok(todoService.getTodos(principal.getId(), category, completed, q, sanitize(pageable)));
    }

    @GetMapping("/stats")
    public ResponseEntity<TodoStatsDto> getStats(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(todoService.getStats(principal.getId()));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(todoService.getCategories(principal.getId()));
    }

    @DeleteMapping("/completed")
    public ResponseEntity<Void> clearCompleted(@AuthenticationPrincipal CustomUserDetails principal) {
        todoService.clearCompleted(principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@AuthenticationPrincipal CustomUserDetails principal,
                                        @RequestBody ReorderRequestDto request) {
        todoService.reorder(principal.getId(), request.ids());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{todoId}")
    public ResponseEntity<TodoResponseDto> getTodo(@AuthenticationPrincipal CustomUserDetails principal,
                                                     @PathVariable Long todoId) {
        return ResponseEntity.ok(todoService.getTodo(principal.getId(), todoId));
    }

    @PutMapping("/{todoId}")
    public ResponseEntity<TodoResponseDto> updateTodo(@AuthenticationPrincipal CustomUserDetails principal,
                                                        @PathVariable Long todoId,
                                                        @Valid @RequestBody TodoRequestDto request) {
        return ResponseEntity.ok(todoService.updateTodo(principal.getId(), todoId, request));
    }

    @PatchMapping("/{todoId}/complete")
    public ResponseEntity<TodoResponseDto> toggleComplete(@AuthenticationPrincipal CustomUserDetails principal,
                                                            @PathVariable Long todoId) {
        return ResponseEntity.ok(todoService.toggleComplete(principal.getId(), todoId));
    }

    @DeleteMapping("/{todoId}")
    public ResponseEntity<Void> deleteTodo(@AuthenticationPrincipal CustomUserDetails principal,
                                            @PathVariable Long todoId) {
        todoService.deleteTodo(principal.getId(), todoId);
        return ResponseEntity.noContent().build();
    }

    private Pageable sanitize(Pageable pageable) {
        List<Sort.Order> allowed = pageable.getSort().stream()
                .filter(order -> SORTABLE.contains(order.getProperty()))
                .toList();
        Sort sort = allowed.isEmpty() ? DEFAULT_SORT : Sort.by(allowed);
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    }
}
