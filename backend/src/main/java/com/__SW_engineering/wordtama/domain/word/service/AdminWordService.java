package com.__SW_engineering.wordtama.domain.word.service;

import com.__SW_engineering.wordtama.domain.word.dto.WordRequest;
import com.__SW_engineering.wordtama.domain.word.dto.WordResponse;
import com.__SW_engineering.wordtama.domain.word.entity.Word;
import com.__SW_engineering.wordtama.domain.word.repository.WordRepository;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminWordService {

    private final WordRepository wordRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional(readOnly = true)
    public List<WordResponse> getWords(Integer day) {
        List<Word> words = (day != null)
                ? wordRepository.findByDayOrderByIdAsc(day)
                : wordRepository.findAllByOrderByDayAscIdAsc();

        return words.stream().map(WordResponse::from).toList();
    }

    public WordResponse addWord(WordRequest request) {
        Word word = Word.builder()
                .day(request.getDay())
                .english(request.getEnglish())
                .korean(request.getKorean())
                .example(request.getExample())
                .exampleKr(request.getExampleKorean())
                .build();
        return WordResponse.from(wordRepository.save(word));
    }

    public WordResponse updateWord(Long wordId, WordRequest request) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));
        word.update(request.getDay(), request.getEnglish(), request.getKorean(),
                request.getExample(), request.getExampleKorean());
        return WordResponse.from(word);
    }

    public void deleteWord(Long wordId) {
        Word word = wordRepository.findById(wordId)
                .orElseThrow(() -> new CustomException(ErrorCode.WORD_NOT_FOUND));
        wordRepository.delete(word);
    }

    public int uploadCsv(MultipartFile file) throws IOException {
        int maxDay = wordRepository.findMaxDay().orElse(0);

        // CSV 유효 행만 먼저 수집
        List<String[]> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .build()
                     .parse(reader)) {

            for (CSVRecord record : parser) {
                try {
                    String english = record.get("english").trim();
                    String korean = record.get("korean").trim();
                    String example = record.get("example").trim();
                    String exampleKorean = record.get("exampleKorean").trim();

                    if (english.isEmpty() || korean.isEmpty()) {
                        log.warn("유효하지 않은 행 스킵 (빈 값): record #{}", record.getRecordNumber());
                        continue;
                    }
                    rows.add(new String[]{english, korean, example, exampleKorean});
                } catch (Exception e) {
                    log.warn("유효하지 않은 행 스킵 (파싱 오류): record #{}", record.getRecordNumber());
                }
            }
        }

        // day 계산 후 EntityManager 배치 인서트
        int count = 0;
        for (int i = 0; i < rows.size(); i++) {
            int day = maxDay + (int) Math.ceil((i + 1) / 30.0);
            String[] row = rows.get(i);

            Word word = Word.builder()
                    .day(day)
                    .english(row[0])
                    .korean(row[1])
                    .example(row[2])
                    .exampleKr(row[3])
                    .build();

            em.persist(word);
            count++;

            // 100개마다 flush/clear로 1차 캐시 비워 OOM 방지
            if (count % 100 == 0) {
                em.flush();
                em.clear();
            }
        }
        em.flush();
        em.clear();

        log.info("CSV 업로드 완료: {}개 저장 (maxDay {} → {})",
                count, maxDay, maxDay + (int) Math.ceil(rows.size() / 30.0));

        return count;
    }
}
