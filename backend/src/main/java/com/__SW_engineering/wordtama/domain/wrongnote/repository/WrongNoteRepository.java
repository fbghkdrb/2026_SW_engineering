package com.__SW_engineering.wordtama.domain.wrongnote.repository;

import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.word.entity.Word;
import com.__SW_engineering.wordtama.domain.wrongnote.entity.WrongNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WrongNoteRepository extends JpaRepository<WrongNote, Long> {

    // JOIN FETCH로 Word를 함께 로드하여 N+1 방지
    @Query("SELECT wn FROM WrongNote wn JOIN FETCH wn.word WHERE wn.user = :user ORDER BY wn.wrongCount DESC")
    List<WrongNote> findByUserOrderByWrongCountDesc(@Param("user") User user);

    Optional<WrongNote> findByUserAndWord(User user, Word word);

    int countByUser(User user);

    void deleteByUser_Id(Long userId);

    void deleteByWord_Id(Long wordId);
}
