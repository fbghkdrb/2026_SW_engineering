package com.__SW_engineering.wordtama.domain.word.service;

import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.user.repository.UserRepository;
import com.__SW_engineering.wordtama.domain.word.dto.DayProgressResponse;
import com.__SW_engineering.wordtama.domain.word.dto.WordWithStatusResponse;
import com.__SW_engineering.wordtama.domain.word.entity.UserWord;
import com.__SW_engineering.wordtama.domain.word.entity.Word;
import com.__SW_engineering.wordtama.domain.word.repository.UserWordRepository;
import com.__SW_engineering.wordtama.domain.word.repository.WordRepository;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WordService {

    private final WordRepository wordRepository;
    private final UserWordRepository userWordRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DayProgressResponse> getDays(Long userId) {
        List<Word> allWords = wordRepository.findAllByOrderByDayAscIdAsc();
        List<UserWord> userWords = userWordRepository.findByUser_Id(userId);

        // 해당 유저가 is_known=true로 표시한 wordId 집합
        Set<Long> knownWordIds = userWords.stream()
                .filter(UserWord::isKnown)
                // Hibernate lazy proxy의 ID 접근은 proxy 초기화 없이 반환됨
                .map(uw -> uw.getWord().getId())
                .collect(Collectors.toSet());

        Map<Integer, List<Word>> byDay = allWords.stream()
                .collect(Collectors.groupingBy(Word::getDay));

        return byDay.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    int total = entry.getValue().size();
                    int known = (int) entry.getValue().stream()
                            .filter(w -> knownWordIds.contains(w.getId()))
                            .count();
                    return DayProgressResponse.builder()
                            .day(entry.getKey())
                            .totalCount(total)
                            .knownCount(known)
                            .progress(total > 0 ? (double) known / total * 100 : 0.0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WordWithStatusResponse> getWords(Integer day, Long userId) {
        List<Word> words = wordRepository.findByDayOrderByIdAsc(day);
        List<Long> wordIds = words.stream().map(Word::getId).collect(Collectors.toList());
        List<UserWord> userWords = userWordRepository.findByUser_IdAndWord_IdIn(userId, wordIds);

        Map<Long, UserWord> userWordMap = userWords.stream()
                .collect(Collectors.toMap(uw -> uw.getWord().getId(), uw -> uw));

        return words.stream()
                .map(word -> {
                    UserWord uw = userWordMap.get(word.getId());
                    return WordWithStatusResponse.builder()
                            .id(word.getId())
                            .day(word.getDay())
                            .english(word.getEnglish())
                            .korean(word.getKorean())
                            .example(word.getExample())
                            .exampleKr(word.getExampleKr())
                            .known(uw != null && uw.isKnown())
                            .favorite(uw != null && uw.isFavorite())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean toggleKnown(Long wordId, Long userId) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));

        Optional<UserWord> existing = userWordRepository.findByUser_IdAndWord_Id(userId, wordId);

        if (existing.isEmpty()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
            try {
                userWordRepository.saveAndFlush(UserWord.builder()
                        .user(user)
                        .word(word)
                        .isKnown(true)
                        .isFavorite(false)
                        .build());
                return true;
            } catch (DataIntegrityViolationException e) {
                UserWord concurrent = userWordRepository.findByUser_IdAndWord_Id(userId, wordId)
                        .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));
                concurrent.toggleKnown();
                return concurrent.isKnown();
            }
        }

        UserWord userWord = existing.get();
        userWord.toggleKnown();
        return userWord.isKnown();
    }

    @Transactional
    public boolean toggleFavorite(Long wordId, Long userId) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));

        Optional<UserWord> existing = userWordRepository.findByUser_IdAndWord_Id(userId, wordId);

        if (existing.isEmpty()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
            try {
                userWordRepository.saveAndFlush(UserWord.builder()
                        .user(user)
                        .word(word)
                        .isKnown(false)
                        .isFavorite(true)
                        .build());
                return true;
            } catch (DataIntegrityViolationException e) {
                UserWord concurrent = userWordRepository.findByUser_IdAndWord_Id(userId, wordId)
                        .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));
                concurrent.toggleFavorite();
                return concurrent.isFavorite();
            }
        }

        UserWord userWord = existing.get();
        userWord.toggleFavorite();
        return userWord.isFavorite();
    }
}
