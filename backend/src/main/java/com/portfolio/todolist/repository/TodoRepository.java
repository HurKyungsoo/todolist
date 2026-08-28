package com.portfolio.todolist.repository;

import com.portfolio.todolist.entity.Todo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    // 로그인한 사용자의 Todo만 페이지 단위로 조회 (카테고리/완료여부 선택 필터)
    Page<Todo> findByUser_IdAndCategoryContainingAndCompleted(
            Long userId, String category, boolean completed, Pageable pageable);

    Page<Todo> findByUser_Id(Long userId, Pageable pageable);

    Page<Todo> findByUser_IdAndCompleted(Long userId, boolean completed, Pageable pageable);

    Page<Todo> findByUser_IdAndCategory(Long userId, String category, Pageable pageable);

    // 본인 Todo인지 함께 확인하며 단건 조회
    Optional<Todo> findByIdAndUser_Id(Long id, Long userId);
}
