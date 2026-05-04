package com.__SW_engineering.wordtama.domain.word.controller;

import com.__SW_engineering.wordtama.domain.word.dto.CsvUploadResponse;
import com.__SW_engineering.wordtama.domain.word.dto.WordRequest;
import com.__SW_engineering.wordtama.domain.word.dto.WordResponse;
import com.__SW_engineering.wordtama.domain.word.service.AdminWordService;
import com.__SW_engineering.wordtama.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/words")
@RequiredArgsConstructor
public class AdminWordController {

    private final AdminWordService adminWordService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WordResponse>>> getWords(
            @RequestParam(required = false) Integer day) {
        List<WordResponse> words = adminWordService.getWords(day);
        return ResponseEntity.ok(ApiResponse.success(words, "단어 목록 조회 성공"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WordResponse>> addWord(
            @RequestBody @Valid WordRequest request) {
        WordResponse word = adminWordService.addWord(request);
        return ResponseEntity.ok(ApiResponse.success(word, "단어 추가 성공"));
    }

    @PutMapping("/{wordId}")
    public ResponseEntity<ApiResponse<WordResponse>> updateWord(
            @PathVariable Long wordId,
            @RequestBody @Valid WordRequest request) {
        WordResponse word = adminWordService.updateWord(wordId, request);
        return ResponseEntity.ok(ApiResponse.success(word, "단어 수정 성공"));
    }

    @DeleteMapping("/{wordId}")
    public ResponseEntity<ApiResponse<Void>> deleteWord(@PathVariable Long wordId) {
        adminWordService.deleteWord(wordId);
        return ResponseEntity.ok(ApiResponse.success("단어 삭제 성공"));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<CsvUploadResponse>> uploadCsv(
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("파일이 비어있습니다."));
        }
        try {
            CsvUploadResponse result = adminWordService.uploadCsv(file);
            return ResponseEntity.ok(ApiResponse.success(result, "CSV 업로드 성공"));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.fail("CSV 파싱 중 오류가 발생했습니다."));
        }
    }
}
