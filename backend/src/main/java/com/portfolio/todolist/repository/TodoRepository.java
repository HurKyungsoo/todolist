package com.portfolio.todolist.repository;

import com.portfolio.todolist.entity.Todo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    // 로그인한 사용자의 Todo만 페이지 단위로 조회 (카테고리 부분일치 / 완료여부 선택 필터)
    Page<Todo> findByUser_Id(Long userId, Pageable pageable);

    Page<Todo> findByUser_IdAndCompleted(Long userId, boolean completed, Pageable pageable);

    Page<Todo> findByUser_IdAndCategoryContaining(Long userId, String category, Pageable pageable);

    Page<Todo> findByUser_IdAndCategoryContainingAndCompleted(
            Long userId, String category, boolean completed, Pageable pageable);
}
