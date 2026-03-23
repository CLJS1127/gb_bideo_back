package com.app.bideo.contest;

import com.app.bideo.dto.contest.ContestEntryRequestDTO;
import com.app.bideo.mapper.contest.ContestMapper;
import com.app.bideo.service.contest.ContestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.BDDMockito.given;

@SpringBootTest
class ContestParticipationServiceTest {

    private ContestMapper contestMapper;
    private ContestService contestService;

    @BeforeEach
    void setUp() {
        contestMapper = Mockito.mock(ContestMapper.class);
        contestService = new ContestService(contestMapper);
    }

    @Test
    void submitEntryRejectsWorkThatDoesNotBelongToMember() {
        ContestEntryRequestDTO requestDTO = ContestEntryRequestDTO.builder()
                .contestId(10L)
                .workId(55L)
                .build();
        given(contestMapper.existsContest(10L)).willReturn(true);
        given(contestMapper.existsOwnedWork(7L, 55L)).willReturn(false);

        assertThrows(IllegalArgumentException.class, () -> contestService.submitEntry(7L, requestDTO));
    }

    @Test
    void submitEntryRejectsDuplicateContestWorkPair() {
        ContestEntryRequestDTO requestDTO = ContestEntryRequestDTO.builder()
                .contestId(10L)
                .workId(55L)
                .build();
        given(contestMapper.existsContest(10L)).willReturn(true);
        given(contestMapper.existsOwnedWork(7L, 55L)).willReturn(true);
        given(contestMapper.existsContestEntry(10L, 55L)).willReturn(true);

        assertThrows(IllegalStateException.class, () -> contestService.submitEntry(7L, requestDTO));
    }

    @Test
    void submitEntryCreatesEntryAndUpdatesEntryCount() {
        ContestEntryRequestDTO requestDTO = ContestEntryRequestDTO.builder()
                .contestId(10L)
                .workId(55L)
                .build();
        given(contestMapper.existsContest(10L)).willReturn(true);
        given(contestMapper.existsOwnedWork(7L, 55L)).willReturn(true);
        given(contestMapper.existsContestEntry(10L, 55L)).willReturn(false);

        assertDoesNotThrow(() -> contestService.submitEntry(7L, requestDTO));

        verify(contestMapper).insertContestEntry(7L, requestDTO);
        verify(contestMapper).increaseContestEntryCount(10L);
    }
}
