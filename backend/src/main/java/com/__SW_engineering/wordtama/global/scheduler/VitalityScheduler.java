package com.__SW_engineering.wordtama.global.scheduler;

import com.__SW_engineering.wordtama.domain.character.service.CharacterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class VitalityScheduler {

    private final CharacterService characterService;

    @Scheduled(cron = "0 0 0 * * *")
    public void decreaseVitalityDaily() {
        log.info("[VitalityScheduler] 자정 활력도 감소 시작");
        characterService.decreaseAllVitality();
        log.info("[VitalityScheduler] 자정 활력도 감소 완료");
    }
}
