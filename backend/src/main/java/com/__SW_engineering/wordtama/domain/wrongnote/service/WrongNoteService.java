package com.__SW_engineering.wordtama.domain.wrongnote.service;

import com.__SW_engineering.wordtama.domain.character.service.CharacterService;
import com.__SW_engineering.wordtama.domain.quiz.entity.Quiz;
import com.__SW_engineering.wordtama.domain.quiz.entity.QuizAnswer;
import com.__SW_engineering.wordtama.domain.quiz.repository.QuizAnswerRepository;
import com.__SW_engineering.wordtama.domain.quiz.repository.QuizRepository;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.user.repository.UserRepository;
import com.__SW_engineering.wordtama.domain.word.entity.Word;
import com.__SW_engineering.wordtama.domain.word.repository.WordRepository;
import com.__SW_engineering.wordtama.domain.wrongnote.dto.WrongNoteQuizQuestionResponse;
import com.__SW_engineering.wordtama.domain.wrongnote.dto.WrongNoteQuizResultResponse;
import com.__SW_engineering.wordtama.domain.wrongnote.dto.WrongNoteQuizSubmitRequest;
import com.__SW_engineering.wordtama.domain.wrongnote.dto.WrongNoteResponse;
import com.__SW_engineering.wordtama.domain.wrongnote.entity.WrongNote;
import com.__SW_engineering.wordtama.domain.wrongnote.entity.DailyQuizPass;
import com.__SW_engineering.wordtama.domain.wrongnote.entity.DailyQuizPassType; // [PBI-11 추가]
import com.__SW_engineering.wordtama.domain.wrongnote.repository.DailyQuizPassRepository;
import com.__SW_engineering.wordtama.domain.wrongnote.repository.WrongNoteRepository;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WrongNoteService {

    private static final int WRONG_NOTE_QUIZ_SIZE = 20;
    private static final int MIN_WRONG_NOTES = 4;
    private static final int VITALITY_GAIN = 20;
    private static final int WRONG_NOTE_QUIZ_ENTRY_THRESHOLD = 20;

    private final WrongNoteRepository wrongNoteRepository;
    private final DailyQuizPassRepository dailyQuizPassRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final QuizRepository quizRepository;
    private final WordRepository wordRepository;
    private final UserRepository userRepository;
    private final CharacterService characterService;

    @Transactional(readOnly = true)
    public List<WrongNoteResponse> getWrongNotes(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return wrongNoteRepository.findByUserOrderByWrongCountDesc(user).stream()
                .map(wn -> WrongNoteResponse.builder()
                        .wordId(wn.getWord().getId())
                        .english(wn.getWord().getEnglish())
                        .korean(wn.getWord().getKorean())
                        .example(wn.getWord().getExample())
                        .exampleKr(wn.getWord().getExampleKr())
                        .wrongCount(wn.getWrongCount())
                        .lastWrongAt(wn.getLastWrongAt())
                        .build())
                .collect(Collectors.toList());
    }

    // QuizService.submitQuiz 완료 후 호출 - is_correct=false인 답안을 wrong_notes에 upsert
    @Transactional
    public void saveWrongNotes(Long userId, Long quizId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<QuizAnswer> wrongAnswers = quizAnswerRepository.findByQuiz_Id(quizId).stream()
                .filter(a -> !a.isCorrect())
                .collect(Collectors.toList());

        for (QuizAnswer answer : wrongAnswers) {
            Word word = answer.getWord();
            wrongNoteRepository.findByUserAndWord(user, word)
                    .ifPresentOrElse(
                            WrongNote::incrementWrongCount,
                            () -> wrongNoteRepository.save(WrongNote.builder()
                                    .user(user)
                                    .word(word)
                                    .build())
                    );
        }
    }

    @Transactional(readOnly = true)
    public List<WrongNoteQuizQuestionResponse> getWrongNoteQuiz(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        List<WrongNote> wrongNotes = wrongNoteRepository.findByUserOrderByWrongCountDesc(user);

        if (wrongNotes.size() < MIN_WRONG_NOTES) {
            throw new CustomException(ErrorCode.INSUFFICIENT_WRONG_NOTES);
        }

        // 랜덤 셔플 후 최대 20개 선택
        List<WrongNote> shuffled = new ArrayList<>(wrongNotes);
        Collections.shuffle(shuffled);
        List<WrongNote> quizNotes = shuffled.stream()
                .limit(WRONG_NOTE_QUIZ_SIZE)
                .collect(Collectors.toList());

        // 보기 후보 풀 (오답 단어 전체의 영단어)
        List<String> wrongWordPool = wrongNotes.stream()
                .map(wn -> wn.getWord().getEnglish())
                .collect(Collectors.toList());

        return quizNotes.stream()
                .map(wn -> buildQuizQuestion(wn, wrongWordPool))
                .collect(Collectors.toList());
    }

    @Transactional
    public WrongNoteQuizResultResponse submitWrongNoteQuiz(Long userId, WrongNoteQuizSubmitRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // quizzes 테이블에 day=0으로 기록
        Quiz quiz = quizRepository.save(Quiz.builder()
                .user(user)
                .day(0)
                .build());

        int correctCount = 0;
        int totalCount = request.getAnswers().size();

        for (WrongNoteQuizSubmitRequest.AnswerItem item : request.getAnswers()) {
            Word word = wordRepository.findById(item.getWordId())
                    .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));

            boolean isCorrect = item.getUserAnswer().trim()
                    .equalsIgnoreCase(word.getEnglish());

            if (isCorrect) correctCount++;

            quizAnswerRepository.save(QuizAnswer.builder()
                    .quiz(quiz)
                    .word(word)
                    .userAnswer(item.getUserAnswer())
                    .correct(isCorrect)
                    .build());
        }

        quiz.complete(totalCount, correctCount);

        boolean qualified = totalCount > 0
                && (double) correctCount / totalCount * 100 >= 80;
        int vitalityGained = 0;
        if (qualified) {
            characterService.addVitality(userId, VITALITY_GAIN);
            vitalityGained = VITALITY_GAIN;
        }

        // [PBI-11 추가] 오늘 WRONG_QUIZ 첫 통과 시 15코인 지급
        boolean alreadyPassedToday = dailyQuizPassRepository
                .existsByUserIdAndPassDateAndType(userId, LocalDate.now(), DailyQuizPassType.WRONG_QUIZ);
        int coinEarned = 0;
        if (qualified && !alreadyPassedToday) {
            characterService.addCoin(userId, 15);
            coinEarned = 15;
        }

        // pass 기록을 동일 트랜잭션 내에서 저장 (원자성 보장)
        if (!alreadyPassedToday) { // [PBI-11 수정] 이미 통과 기록 있으면 중복 저장 방지 (정상 응답 반환)
            dailyQuizPassRepository.save(DailyQuizPass.builder()
                    .user(user)
                    .passDate(LocalDate.now())
                    .quiz(quiz)
                    .type(DailyQuizPassType.WRONG_QUIZ) // [PBI-11 추가]
                    .build());
        }

        return WrongNoteQuizResultResponse.builder()
                .quizId(quiz.getId())
                .correctCount(correctCount)
                .totalCount(totalCount)
                .vitalityGained(vitalityGained)
                .coinEarned(coinEarned) // [PBI-11 추가]
                .build();
    }

    @Transactional
    public void deleteWrongNote(Long userId, Long wordId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));

        WrongNote wrongNote = wrongNoteRepository.findByUserAndWord(user, word)
                .orElseThrow(() -> new CustomException(ErrorCode.WRONG_NOTE_NOT_FOUND));

        wrongNoteRepository.delete(wrongNote);
    }

    // 오답 퀴즈 진입 조건 체크: 오답 단어 수 > 20 AND 오늘 WRONG_QUIZ 미통과
    @Transactional(readOnly = true)
    public void checkQuizEntryCondition(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        int wrongNoteCount = wrongNoteRepository.findByUserOrderByWrongCountDesc(user).size();
        if (wrongNoteCount < WRONG_NOTE_QUIZ_ENTRY_THRESHOLD) {
            throw new CustomException(ErrorCode.WRONG_NOTE_COUNT_INSUFFICIENT);
        }

        // [PBI-11 수정] WRONG_QUIZ 타입으로만 체크 — 일반 퀴즈 통과 여부와 독립적으로 관리
        boolean alreadyPassed = dailyQuizPassRepository
                .existsByUserIdAndPassDateAndType(userId, LocalDate.now(), DailyQuizPassType.WRONG_QUIZ);
        if (alreadyPassed) {
            throw new CustomException(ErrorCode.DAILY_QUIZ_ALREADY_PASSED);
        }
    }

    private WrongNoteQuizQuestionResponse buildQuizQuestion(WrongNote wn, List<String> wrongWordPool) {
        String correctAnswer = wn.getWord().getEnglish();

        // 정답을 제외한 오답 보기 풀
        List<String> distractorPool = wrongWordPool.stream()
                .filter(e -> !e.equalsIgnoreCase(correctAnswer))
                .collect(Collectors.toList());

        // 오답 풀에서 3개 부족 시 전체 단어에서 보충
        if (distractorPool.size() < 3) {
            List<String> allEnglish = wordRepository.findAll().stream()
                    .map(Word::getEnglish)
                    .filter(e -> !e.equalsIgnoreCase(correctAnswer)
                            && !distractorPool.contains(e))
                    .collect(Collectors.toList());
            Collections.shuffle(allEnglish);
            int needed = 3 - distractorPool.size();
            distractorPool.addAll(allEnglish.stream().limit(needed).collect(Collectors.toList()));
        }

        Collections.shuffle(distractorPool);
        List<String> choices = new ArrayList<>(distractorPool.subList(0, 3));
        choices.add(correctAnswer);
        Collections.shuffle(choices);

        return WrongNoteQuizQuestionResponse.builder()
                .wordId(wn.getWord().getId())
                .english(correctAnswer)
                .korean(wn.getWord().getKorean())
                .choices(choices)
                .build();
    }
}
