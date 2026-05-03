package com.__SW_engineering.wordtama.domain.stats.service;

import com.__SW_engineering.wordtama.domain.quiz.entity.Quiz;
import com.__SW_engineering.wordtama.domain.quiz.repository.QuizRepository;
import com.__SW_engineering.wordtama.domain.stats.dto.ProgressResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private static final int TOTAL_DAYS = 50;
    private static final double COMPLETION_THRESHOLD = 0.8;

    private final QuizRepository quizRepository;

    @Transactional(readOnly = true)
    public ProgressResponseDto getProgress(Long userId) {
        // day별 가장 최근(id 최대) 제출 완료 퀴즈를 하나씩 남김
        Map<Integer, Quiz> latestPerDay = quizRepository.findByUser_IdAndCompletedTrue(userId)
                .stream()
                .collect(Collectors.toMap(
                        Quiz::getDay,
                        Function.identity(),
                        (q1, q2) -> q1.getId() > q2.getId() ? q1 : q2
                ));

        // 정답률 0.8 이상인 day만 완료 처리
        List<Integer> completedDayList = latestPerDay.values().stream()
                .filter(q -> q.getTotalCount() != null
                        && q.getTotalCount() > 0
                        && (double) q.getCorrectCount() / q.getTotalCount() >= COMPLETION_THRESHOLD)
                .map(Quiz::getDay)
                .sorted()
                .collect(Collectors.toList());

        int completedDays = completedDayList.size();

        return ProgressResponseDto.builder()
                .completedDays(completedDays)
                .totalDays(TOTAL_DAYS)
                .progressRate((double) completedDays / TOTAL_DAYS)
                .completedDayList(completedDayList)
                .build();
    }
}
