package com.__SW_engineering.wordtama.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    DUPLICATE_USERNAME(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),
    REFRESH_TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "RefreshToken이 존재하지 않습니다."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    WORD_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 단어입니다."),
    QUIZ_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 퀴즈입니다."),
    QUIZ_ALREADY_COMPLETED(HttpStatus.BAD_REQUEST, "이미 완료된 퀴즈입니다."),
    CHARACTER_NOT_FOUND(HttpStatus.NOT_FOUND, "캐릭터를 찾을 수 없습니다."),
    CHARACTER_NOT_FAINT(HttpStatus.BAD_REQUEST, "기절 상태가 아닌 캐릭터는 부활시킬 수 없습니다."),
    INSUFFICIENT_COIN(HttpStatus.BAD_REQUEST, "코인이 부족합니다."),
    INSUFFICIENT_WRONG_NOTES(HttpStatus.BAD_REQUEST, "오답 단어가 4개 미만이어서 퀴즈를 시작할 수 없습니다."),
    WRONG_NOTE_COUNT_INSUFFICIENT(HttpStatus.BAD_REQUEST, "오답 단어가 20개 이상이어야 퀴즈를 시작할 수 있습니다."),
    DAILY_QUIZ_ALREADY_PASSED(HttpStatus.BAD_REQUEST, "오답 퀴즈는 하루에 1번만 통과할 수 있습니다."),
    WRONG_NOTE_NOT_FOUND(HttpStatus.NOT_FOUND, "오답노트에 존재하지 않는 단어입니다."),
    INVALID_DIRECTION(HttpStatus.BAD_REQUEST, "direction 파라미터는 필수입니다 (EN_TO_KO / KO_TO_EN)"),
    INSUFFICIENT_WORDS_FOR_QUIZ(HttpStatus.BAD_REQUEST, "객관식 퀴즈를 위한 단어가 부족합니다. 최소 4개가 필요합니다."),
    INSUFFICIENT_ITEM(HttpStatus.BAD_REQUEST, "보유한 아이템이 없습니다."), // [PBI-11 추가]
    VITALITY_ALREADY_MAX(HttpStatus.BAD_REQUEST, "활력이 이미 최대치(100)입니다."),
    NOTIFICATION_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 알림입니다.");

    private final HttpStatus status;
    private final String message;
}
