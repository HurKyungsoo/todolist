package com.portfolio.todolist.dto;

import java.util.List;

// 드래그 정렬 결과 — 새 순서의 Todo id 배열
public record ReorderRequestDto(List<Long> ids) {
}
