package com.__SW_engineering.wordtama.domain.quiz.repository;

import com.__SW_engineering.wordtama.domain.quiz.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Optional<Quiz> findByIdAndUser_Id(Long id, Long userId);
}
