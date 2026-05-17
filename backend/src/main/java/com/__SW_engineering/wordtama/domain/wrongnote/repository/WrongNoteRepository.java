package com.__SW_engineering.wordtama.domain.wrongnote.repository;

import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.word.entity.Word;
import com.__SW_engineering.wordtama.domain.wrongnote.entity.WrongNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WrongNoteRepository extends JpaRepository<WrongNote, Long> {

    List<WrongNote> findByUserOrderByWrongCountDesc(User user);

    Optional<WrongNote> findByUserAndWord(User user, Word word);

    void deleteByUser_Id(Long userId);

    void deleteByWord_Id(Long wordId);
}
