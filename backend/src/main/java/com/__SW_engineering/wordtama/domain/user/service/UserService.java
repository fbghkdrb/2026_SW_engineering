package com.__SW_engineering.wordtama.domain.user.service;

import com.__SW_engineering.wordtama.domain.attendance.repository.AttendanceRepository;
import com.__SW_engineering.wordtama.domain.auth.repository.RefreshTokenRepository;
import com.__SW_engineering.wordtama.domain.character.repository.CharacterRepository;
import com.__SW_engineering.wordtama.domain.notification.repository.NotificationRepository;
import com.__SW_engineering.wordtama.domain.quiz.repository.QuizAnswerRepository;
import com.__SW_engineering.wordtama.domain.quiz.repository.QuizRepository;
import com.__SW_engineering.wordtama.domain.shop.repository.UserItemRepository;
import com.__SW_engineering.wordtama.domain.user.dto.NicknameUpdateRequest;
import com.__SW_engineering.wordtama.domain.user.dto.UserResponse;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.user.repository.UserRepository;
import com.__SW_engineering.wordtama.domain.word.repository.UserWordRepository;
import com.__SW_engineering.wordtama.domain.wrongnote.repository.DailyQuizPassRepository;
import com.__SW_engineering.wordtama.domain.wrongnote.repository.WrongNoteRepository;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserWordRepository userWordRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final QuizRepository quizRepository;
    private final CharacterRepository characterRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final WrongNoteRepository wrongNoteRepository;
    private final DailyQuizPassRepository dailyQuizPassRepository;
    private final UserItemRepository userItemRepository;
    private final AttendanceRepository attendanceRepository;
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public UserResponse getMe(Long userId) {
        User user = findById(userId);
        return UserResponse.from(user);
    }

    @Transactional
    public void updateNickname(Long userId, NicknameUpdateRequest request) {
        User user = findById(userId);
        user.updateNickname(request.getNickname());
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = findById(userId);
        quizAnswerRepository.deleteByQuiz_User_Id(userId);
        dailyQuizPassRepository.deleteByUserId(userId);
        quizRepository.deleteByUser_Id(userId);
        wrongNoteRepository.deleteByUser_Id(userId);
        userWordRepository.deleteByUser_Id(userId);
        userItemRepository.deleteByUserId(userId);
        attendanceRepository.deleteByUserId(userId);
        characterRepository.deleteByUserId(userId);
        refreshTokenRepository.deleteByUserId(userId);
        notificationRepository.deleteByUser_Id(userId);
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public boolean checkUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    private User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
