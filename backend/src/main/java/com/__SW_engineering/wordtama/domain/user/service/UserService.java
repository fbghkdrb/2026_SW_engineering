package com.__SW_engineering.wordtama.domain.user.service;

import com.__SW_engineering.wordtama.domain.user.dto.NicknameUpdateRequest;
import com.__SW_engineering.wordtama.domain.user.dto.UserResponse;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.user.repository.UserRepository;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
