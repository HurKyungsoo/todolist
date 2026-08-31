package com.portfolio.todolist.dto;

import lombok.Getter;

@Getter
public class TodoStatsDto {

    private final long total;
    private final long active;    // 미완료
    private final long completed; // 완료
    private final long overdue;   // 미완료 && 기한 초과
    private final int donePct;    // 완료율(%)

    public TodoStatsDto(long total, long completed, long overdue) {
        this.total = total;
        this.completed = completed;
        this.active = total - completed;
        this.overdue = overdue;
        this.donePct = total == 0 ? 0 : (int) Math.round(completed * 100.0 / total);
    }
}
