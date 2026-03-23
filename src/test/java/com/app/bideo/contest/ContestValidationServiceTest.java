package com.app.bideo.contest;

import com.app.bideo.dto.contest.ContestCreateRequestDTO;
import com.app.bideo.dto.contest.ContestUpdateRequestDTO;
import com.app.bideo.mapper.contest.ContestMapper;
import com.app.bideo.service.contest.ContestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.BDDMockito.given;

@SpringBootTest
class ContestValidationServiceTest {

    private ContestMapper contestMapper;
    private ContestService contestService;

    @BeforeEach
    void setUp() {
        contestMapper = Mockito.mock(ContestMapper.class);
        contestService = new ContestService(contestMapper);
    }

    @Test
    void createContestRejectsBlankTitle() {
        ContestCreateRequestDTO requestDTO = ContestCreateRequestDTO.builder()
                .title(" ")
                .organizer("BIDEO")
                .entryStart(LocalDate.of(2026, 3, 20))
                .entryEnd(LocalDate.of(2026, 3, 30))
                .build();

        assertThrows(IllegalArgumentException.class, () -> contestService.createContest(7L, requestDTO));
    }

    @Test
    void createContestRejectsWhenEntryStartIsAfterEntryEnd() {
        ContestCreateRequestDTO requestDTO = ContestCreateRequestDTO.builder()
                .title("공모전")
                .organizer("BIDEO")
                .entryStart(LocalDate.of(2026, 3, 30))
                .entryEnd(LocalDate.of(2026, 3, 20))
                .build();

        assertThrows(IllegalArgumentException.class, () -> contestService.createContest(7L, requestDTO));
    }

    @Test
    void updateContestRejectsWhenResultDateIsBeforeEntryEnd() {
        ContestUpdateRequestDTO requestDTO = ContestUpdateRequestDTO.builder()
                .title("수정 공모전")
                .organizer("BIDEO")
                .entryStart(LocalDate.of(2026, 3, 20))
                .entryEnd(LocalDate.of(2026, 3, 30))
                .resultDate(LocalDate.of(2026, 3, 25))
                .build();

        assertThrows(IllegalArgumentException.class, () -> contestService.updateContest(9L, 7L, requestDTO));
    }

    @Test
    void createContestSavesWhenRequestIsValid() {
        ContestCreateRequestDTO requestDTO = ContestCreateRequestDTO.builder()
                .title("공모전")
                .organizer("BIDEO")
                .entryStart(LocalDate.of(2026, 3, 20))
                .entryEnd(LocalDate.of(2026, 3, 30))
                .resultDate(LocalDate.of(2026, 4, 2))
                .build();

        contestService.createContest(7L, requestDTO);

        verify(contestMapper).insertContest(eq(7L), any(ContestCreateRequestDTO.class));
    }

    @Test
    void updateContestSavesWhenRequestIsValid() {
        ContestUpdateRequestDTO requestDTO = ContestUpdateRequestDTO.builder()
                .title("수정 공모전")
                .organizer("BIDEO")
                .entryStart(LocalDate.of(2026, 3, 20))
                .entryEnd(LocalDate.of(2026, 3, 30))
                .resultDate(LocalDate.of(2026, 4, 2))
                .build();
        given(contestMapper.updateContest(9L, 7L, requestDTO)).willReturn(1);

        contestService.updateContest(9L, 7L, requestDTO);

        verify(contestMapper).updateContest(9L, 7L, requestDTO);
    }
}
