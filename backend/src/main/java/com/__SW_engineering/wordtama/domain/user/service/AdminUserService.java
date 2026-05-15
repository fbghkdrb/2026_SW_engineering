package com.__SW_engineering.wordtama.domain.user.service;

import com.__SW_engineering.wordtama.domain.user.dto.UserResponse;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.user.repository.UserRepository;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse toggleUserRole(Long adminId, Long targetUserId) {
        // 본인 권한 변경 방어
        if (adminId.equals(targetUserId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        user.toggleRole();
        return UserResponse.from(user);
    }
}
