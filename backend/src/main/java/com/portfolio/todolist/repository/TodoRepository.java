package com.portfolio.todolist.repository;

import com.portfolio.todolist.entity.Todo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    long countByUser_Id(Long userId);

    long countByUser_IdAndCompleted(Long userId, boolean completed);

    // 미완료 && 마감이 지난 항목 수
    @Query("SELECT COUNT(t) FROM Todo t WHERE t.user.id = :userId AND t.completed = false AND t.dueDate < :now")
    long countOverdue(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    // 사용자가 실제로 쓴 카테고리 목록 (필터 드롭다운용)
    @Query("SELECT DISTINCT t.category FROM Todo t WHERE t.user.id = :userId AND t.category IS NOT NULL ORDER BY t.category")
    List<String> findDistinctCategories(@Param("userId") Long userId);

    // 완료 항목 일괄 삭제
    @Modifying
    @Query("DELETE FROM Todo t WHERE t.user.id = :userId AND t.completed = true")
    int deleteCompleted(@Param("userId") Long userId);

    /**
     * 로그인한 사용자의 Todo를 페이지 단위로 조회한다.
     * category / completed / keyword 는 모두 선택 필터 — null 이면 해당 조건을 건너뛴다.
     * keyword 는 제목·내용 부분일치(대소문자 무시).
     */
    @Query("""
            SELECT t FROM Todo t
            WHERE t.user.id = :userId
              AND (:category IS NULL OR t.category = :category)
              AND (:completed IS NULL OR t.completed = :completed)
              AND (:keyword IS NULL
                   OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(CAST(t.content AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<Todo> search(@Param("userId") Long userId,
                      @Param("category") String category,
                      @Param("completed") Boolean completed,
                      @Param("keyword") String keyword,
                      Pageable pageable);
}
