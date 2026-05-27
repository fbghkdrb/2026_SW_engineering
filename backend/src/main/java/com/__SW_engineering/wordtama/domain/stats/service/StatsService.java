package com.__SW_engineering.wordtama.domain.stats.service;

import com.__SW_engineering.wordtama.domain.quiz.entity.Quiz;
import com.__SW_engineering.wordtama.domain.quiz.repository.QuizRepository;
import com.__SW_engineering.wordtama.domain.stats.dto.ProgressResponseDto;
import com.__SW_engineering.wordtama.domain.stats.dto.QuizAccuracyDto;
import com.__SW_engineering.wordtama.domain.stats.dto.WeeklyStatDto;
import com.__SW_engineering.wordtama.domain.word.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class StatsService {

    private static final double COMPLETION_THRESHOLD = 0.8;
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final QuizRepository quizRepository;
    private final WordRepository wordRepository;

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
        int totalDays = wordRepository.findMaxDay().orElse(0);

        return ProgressResponseDto.builder()
                .completedDays(completedDays)
                .totalDays(totalDays)
                .progressRate(totalDays > 0 ? (double) completedDays / totalDays : 0.0)
                .completedDayList(completedDayList)
                .build();
    }

    // 최근 완료된 퀴즈 10개 정답률 목록
    @Transactional(readOnly = true)
    public List<QuizAccuracyDto> getQuizAccuracy(Long userId) {
        return quizRepository.findTop10ByUser_IdAndCompletedTrueOrderByCreatedAtDesc(userId)
                .stream()
                .map(q -> {
                    double accuracy = (q.getTotalCount() != null && q.getTotalCount() > 0)
                            ? Math.round((double) q.getCorrectCount() / q.getTotalCount() * 1000.0) / 10.0
                            : 0.0;
                    return QuizAccuracyDto.builder()
                            .quizId(q.getId())
                            .day(q.getDay())
                            .correctCount(q.getCorrectCount())
                            .totalCount(q.getTotalCount())
                            .accuracy(accuracy)
                            .createdAt(q.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // 최근 7일(오늘 포함) 날짜별 퀴즈 응시 횟수
    @Transactional(readOnly = true)
    public List<WeeklyStatDto> getWeeklyStats(Long userId) {
        LocalDate today = LocalDate.now(SEOUL);
        ZoneId server = ZoneId.systemDefault();

        // 서버 로컬 타임존 기준 경계 계산
        LocalDateTime start = today.minusDays(6).atStartOfDay(SEOUL)
                .withZoneSameInstant(server).toLocalDateTime();
        LocalDateTime end = today.plusDays(1).atStartOfDay(SEOUL)
                .withZoneSameInstant(server).toLocalDateTime();

        List<Quiz> quizzes = quizRepository.findByUser_IdAndCompletedTrueAndCreatedAtBetween(userId, start, end);

        // createdAt → Seoul 날짜로 변환하여 집계
        Map<LocalDate, Long> countByDate = quizzes.stream()
                .collect(Collectors.groupingBy(
                        q -> q.getCreatedAt().atZone(server).withZoneSameInstant(SEOUL).toLocalDate(),
                        Collectors.counting()
                ));

        return IntStream.rangeClosed(0, 6)
                .mapToObj(i -> today.minusDays(6 - i))
                .map(date -> WeeklyStatDto.builder()
                        .date(date.toString())
                        .count(countByDate.getOrDefault(date, 0L).intValue())
                        .build())
                .collect(Collectors.toList());
    }
}
