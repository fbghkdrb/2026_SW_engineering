package com.__SW_engineering.wordtama.domain.quiz.service;

import com.__SW_engineering.wordtama.domain.character.service.CharacterService;
import com.__SW_engineering.wordtama.domain.wrongnote.entity.DailyQuizPass;
import com.__SW_engineering.wordtama.domain.wrongnote.repository.DailyQuizPassRepository;
import com.__SW_engineering.wordtama.domain.wrongnote.service.WrongNoteService;
import com.__SW_engineering.wordtama.domain.quiz.dto.*;
import com.__SW_engineering.wordtama.domain.quiz.entity.Quiz;
import com.__SW_engineering.wordtama.domain.quiz.entity.QuizAnswer;
import com.__SW_engineering.wordtama.domain.quiz.repository.QuizAnswerRepository;
import com.__SW_engineering.wordtama.domain.quiz.repository.QuizRepository;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.user.repository.UserRepository;
import com.__SW_engineering.wordtama.domain.word.entity.Word;
import com.__SW_engineering.wordtama.domain.word.repository.WordRepository;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private static final int QUIZ_SIZE = 10;

    private final QuizRepository quizRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final WordRepository wordRepository;
    private final UserRepository userRepository;
    private final CharacterService characterService;
    private final WrongNoteService wrongNoteService;
    private final DailyQuizPassRepository dailyQuizPassRepository;

    // checkAndRecordDailyPass 반환용 내부 레코드
    private record PassResult(boolean isPassed, boolean isFirstPassToday) {}

    @Transactional(readOnly = true)
    public List<QuizQuestionResponse> getQuizQuestions(Integer day) {
        List<Word> words = new ArrayList<>(wordRepository.findByDayOrderByIdAsc(day));
        Collections.shuffle(words);

        return words.stream()
                .limit(QUIZ_SIZE)
                .map(word -> QuizQuestionResponse.builder()
                        .wordId(word.getId())
                        .korean(word.getKorean())
                        .exampleKr(word.getExampleKr())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public StartQuizResponse startQuiz(Long userId, StartQuizRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Quiz quiz = quizRepository.save(Quiz.builder()
                .user(user)
                .day(request.getDay())
                .build());
        return StartQuizResponse.builder()
                .quizId(quiz.getId())
                .build();
    }

    @Transactional
    public AnswerFeedbackResponse submitAnswer(Long userId, Long quizId, AnswerRequest request) {
        Quiz quiz = quizRepository.findByIdAndUser_Id(quizId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUIZ_NOT_FOUND));

        if (quiz.isCompleted()) {
            throw new CustomException(ErrorCode.QUIZ_ALREADY_COMPLETED);
        }

        Word word = wordRepository.findById(request.getWordId())
                .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));

        boolean isCorrect = request.getUserAnswer().trim()
                .equalsIgnoreCase(word.getEnglish());

        quizAnswerRepository.save(QuizAnswer.builder()
                .quiz(quiz)
                .word(word)
                .userAnswer(request.getUserAnswer())
                .correct(isCorrect)
                .build());

        return AnswerFeedbackResponse.builder()
                .correct(isCorrect)
                .correctAnswer(word.getEnglish())
                .build();
    }

    @Transactional
    public QuizResultResponse submitQuiz(Long userId, Long quizId) {
        Quiz quiz = quizRepository.findByIdAndUser_Id(quizId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUIZ_NOT_FOUND));

        if (quiz.isCompleted()) {
            throw new CustomException(ErrorCode.QUIZ_ALREADY_COMPLETED);
        }

        List<QuizAnswer> answers = quizAnswerRepository.findByQuiz_Id(quizId);
        int totalCount = answers.size();
        int correctCount = (int) answers.stream().filter(QuizAnswer::isCorrect).count();

        quiz.complete(totalCount, correctCount);

        // PBI-08: 하루 1회 통과 체크 및 vitality 보상
        PassResult passResult = checkAndRecordDailyPass(userId, quizId, correctCount, totalCount);
        if (passResult.isFirstPassToday()) {
            characterService.addVitality(userId, 20);
        }

        List<WrongWordDto> wrongWords = answers.stream()
                .filter(a -> !a.isCorrect())
                .map(a -> WrongWordDto.builder()
                        .wordId(a.getWord().getId())
                        .english(a.getWord().getEnglish())
                        .korean(a.getWord().getKorean())
                        .build())
                .collect(Collectors.toList());

        wrongNoteService.saveWrongNotes(userId, quizId);

        return QuizResultResponse.builder()
                .totalCount(totalCount)
                .correctCount(correctCount)
                .coinEarned(0)
                .wrongWords(wrongWords)
                .isPassed(passResult.isPassed())
                .isFirstPassToday(passResult.isFirstPassToday())
                .build();
    }

    @Transactional(readOnly = true)
    public List<MultipleQuizQuestionResponse> getMultipleQuizQuestions(Integer day, String direction) {
        if (direction == null || direction.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_DIRECTION);
        }

        boolean isEnToKo = "EN_TO_KO".equalsIgnoreCase(direction);
        if (!isEnToKo && !"KO_TO_EN".equalsIgnoreCase(direction)) {
            throw new CustomException(ErrorCode.INVALID_DIRECTION);
        }

        // 해당 day 단어를 섞은 뒤 최대 10개 출제
        List<Word> dayWords = new ArrayList<>(wordRepository.findByDayOrderByIdAsc(day));
        Collections.shuffle(dayWords);
        List<Word> questionWords = dayWords.stream().limit(QUIZ_SIZE).collect(Collectors.toList());

        // 다른 day 단어 (보기 보충용 — 같은 day 단어가 4개 미만일 때)
        List<Word> otherDayWords = new ArrayList<>(wordRepository.findAllByOrderByDayAscIdAsc().stream()
                .filter(w -> !w.getDay().equals(day))
                .collect(Collectors.toList()));

        List<MultipleQuizQuestionResponse> result = new ArrayList<>();
        for (Word questionWord : questionWords) {
            // 이미 선택된 보기 값을 추적하는 Set (정답 값 포함하여 초기화)
            Set<String> usedValues = new HashSet<>();
            usedValues.add(isEnToKo ? questionWord.getKorean() : questionWord.getEnglish());

            // 같은 day에서 정답 ID 및 보기 값 중복 제외한 오답 후보
            List<Word> sameDayCandidates = new ArrayList<>(dayWords.stream()
                    .filter(w -> !w.getId().equals(questionWord.getId()))
                    .filter(w -> isEnToKo
                            ? !usedValues.contains(w.getKorean())
                            : !usedValues.contains(w.getEnglish()))
                    .collect(Collectors.toList()));
            Collections.shuffle(sameDayCandidates);

            // 오답 후보 간 값 중복도 제거하며 최대 3개 선택
            List<Word> wrongWords = new ArrayList<>();
            for (Word candidate : sameDayCandidates) {
                if (wrongWords.size() >= 3) break;
                String val = isEnToKo ? candidate.getKorean() : candidate.getEnglish();
                if (usedValues.add(val)) {
                    wrongWords.add(candidate);
                }
            }

            // 같은 day 단어가 부족하면 다른 day에서 보충 (값 중복 제외)
            if (wrongWords.size() < 3) {
                List<Word> shuffledOther = new ArrayList<>(otherDayWords);
                Collections.shuffle(shuffledOther);
                for (Word candidate : shuffledOther) {
                    if (wrongWords.size() >= 3) break;
                    String val = isEnToKo ? candidate.getKorean() : candidate.getEnglish();
                    if (usedValues.add(val)) {
                        wrongWords.add(candidate);
                    }
                }
            }

            // 정답 1 + 오답 3 = 4지선다 구성 후 셔플
            List<String> choices = new ArrayList<>();
            if (isEnToKo) {
                choices.add(questionWord.getKorean());
                wrongWords.forEach(w -> choices.add(w.getKorean()));
            } else {
                choices.add(questionWord.getEnglish());
                wrongWords.forEach(w -> choices.add(w.getEnglish()));
            }

            // DB 전체 단어 부족으로 4지선다 구성 불가
            if (choices.size() < 4) {
                throw new CustomException(ErrorCode.INSUFFICIENT_WORDS_FOR_QUIZ);
            }

            Collections.shuffle(choices);

            result.add(MultipleQuizQuestionResponse.builder()
                    .wordId(questionWord.getId())
                    .question(isEnToKo ? questionWord.getEnglish() : questionWord.getKorean())
                    .choices(choices)
                    .correctAnswer(isEnToKo ? questionWord.getKorean() : questionWord.getEnglish())
                    .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<BlankQuizQuestionResponse> getBlankQuizQuestions(Integer day) {
        // 셔플 후 example 있는 단어만 최대 10개 출제
        List<Word> dayWords = new ArrayList<>(wordRepository.findByDayOrderByIdAsc(day));
        Collections.shuffle(dayWords);

        return dayWords.stream()
                .filter(w -> w.getExample() != null && !w.getExample().isBlank())
                .limit(QUIZ_SIZE)
                .map(w -> {
                    // 대소문자 무시하여 영어 단어를 ___ 로 치환
                    String blankSentence = w.getExample()
                            .replaceAll("(?i)" + Pattern.quote(w.getEnglish()), "___");
                    return BlankQuizQuestionResponse.builder()
                            .wordId(w.getId())
                            .blankSentence(blankSentence)
                            .korean(w.getKorean())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // 통과 여부 판정 및 하루 1회 DailyQuizPass 저장
    private PassResult checkAndRecordDailyPass(Long userId, Long quizId, int correctCount, int totalCount) {
        if (totalCount <= 0 || (correctCount * 100 / totalCount) < 80) {
            return new PassResult(false, false);
        }

        boolean alreadyPassed = dailyQuizPassRepository
                .findByUserIdAndPassDate(userId, LocalDate.now())
                .isPresent();

        if (alreadyPassed) {
            return new PassResult(true, false);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new CustomException(ErrorCode.QUIZ_NOT_FOUND));

        try {
            dailyQuizPassRepository.save(
                    DailyQuizPass.builder()
                            .user(user)
                            .passDate(LocalDate.now())
                            .quiz(quiz)
                            .build()
            );
        } catch (DataIntegrityViolationException e) {
            // 동시 요청으로 unique 제약 위반 시 — 이미 오늘 통과 기록 존재
            return new PassResult(true, false);
        }

        return new PassResult(true, true);
    }

    @Transactional(readOnly = true)
    public TodayPassResponse getTodayPassStatus(Long userId) {
        return dailyQuizPassRepository
                .findByUserIdAndPassDate(userId, LocalDate.now())
                .map(pass -> TodayPassResponse.builder()
                        .isPassedToday(true)
                        .passedAt(pass.getCreatedAt())
                        .build())
                .orElse(TodayPassResponse.builder()
                        .isPassedToday(false)
                        .passedAt(null)
                        .build());
    }
}
