package com.__SW_engineering.wordtama.domain.quiz.service;

import com.__SW_engineering.wordtama.domain.character.service.CharacterService;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
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
        User user = userRepository.getReferenceById(userId);
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
        characterService.applyQuizResult(userId, correctCount, totalCount);

        List<WrongWordDto> wrongWords = answers.stream()
                .filter(a -> !a.isCorrect())
                .map(a -> WrongWordDto.builder()
                        .wordId(a.getWord().getId())
                        .english(a.getWord().getEnglish())
                        .korean(a.getWord().getKorean())
                        .build())
                .collect(Collectors.toList());

        return QuizResultResponse.builder()
                .totalCount(totalCount)
                .correctCount(correctCount)
                .coinEarned(0)
                .wrongWords(wrongWords)
                .build();
    }
}
