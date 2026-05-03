package com.__SW_engineering.wordtama.domain.quiz.repository;

import com.__SW_engineering.wordtama.domain.quiz.entity.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, Long> {

    List<QuizAnswer> findByQuiz_Id(Long quizId);

    void deleteByQuiz_User_Id(Long userId);
}
