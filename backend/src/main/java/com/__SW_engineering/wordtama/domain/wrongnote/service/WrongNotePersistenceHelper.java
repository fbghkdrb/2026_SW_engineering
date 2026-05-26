package com.__SW_engineering.wordtama.domain.wrongnote.service;

import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.word.entity.Word;
import com.__SW_engineering.wordtama.domain.wrongnote.entity.WrongNote;
import com.__SW_engineering.wordtama.domain.wrongnote.repository.WrongNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WrongNotePersistenceHelper {

    private final WrongNoteRepository wrongNoteRepository;

    /**
     * 독립 트랜잭션에서 saveOrIncrement 수행.
     * DataIntegrityViolationException이 발생해도 외부 트랜잭션에 영향 없음.
     * REQUIRES_NEW 이므로 self-invocation 문제 없이 프록시를 통해 호출.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveOrIncrement(User user, Word word) {
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
