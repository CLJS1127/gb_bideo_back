package com.app.bideo.service.contest;

import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.contest.ContestCreateRequestDTO;
import com.app.bideo.dto.contest.ContestDetailResponseDTO;
import com.app.bideo.dto.contest.ContestEntryRequestDTO;
import com.app.bideo.dto.contest.ContestEntryResponseDTO;
import com.app.bideo.dto.contest.ContestListResponseDTO;
import com.app.bideo.dto.contest.ContestSearchDTO;
import com.app.bideo.dto.contest.ContestWorkOptionDTO;
import com.app.bideo.dto.contest.ContestUpdateRequestDTO;
import com.app.bideo.mapper.contest.ContestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class ContestService {

    private final ContestMapper contestMapper;

    public Long createContest(Long memberId, ContestCreateRequestDTO contestCreateRequestDTO) {
        validateContestCreateRequest(contestCreateRequestDTO);
        contestMapper.insertContest(memberId, contestCreateRequestDTO);
        Long contestId = contestCreateRequestDTO.getId();
        saveTags(contestId, contestCreateRequestDTO.getTagIds());
        return contestId;
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<ContestListResponseDTO> getContestList(ContestSearchDTO searchDTO) {
        List<ContestListResponseDTO> list = contestMapper.selectContestList(searchDTO);
        int total = contestMapper.selectContestCount(searchDTO);
        int size = searchDTO.getSize() != null ? searchDTO.getSize() : 10;
        int totalPages = (int) Math.ceil((double) total / size);

        return PageResponseDTO.<ContestListResponseDTO>builder()
                .content(list)
                .page(searchDTO.getPage())
                .size(size)
                .totalElements((long) total)
                .totalPages(totalPages)
                .build();
    }

    @Transactional(readOnly = true)
    public ContestDetailResponseDTO getContestDetail(Long id, Long memberId) {
        ContestDetailResponseDTO result = contestMapper.selectContestDetail(id, memberId);
        if (result == null) {
            throw new IllegalArgumentException("contest not found");
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<ContestEntryResponseDTO> getContestEntryList(Long contestId) {
        return contestMapper.selectContestEntryList(contestId);
    }

    public void submitEntry(Long memberId, ContestEntryRequestDTO requestDTO) {
        if (requestDTO.getContestId() == null || requestDTO.getWorkId() == null) {
            throw new IllegalArgumentException("contest and work are required");
        }
        if (!contestMapper.existsContest(requestDTO.getContestId())) {
            throw new IllegalArgumentException("contest not found");
        }
        if (!contestMapper.existsOwnedWork(memberId, requestDTO.getWorkId())) {
            throw new IllegalArgumentException("work does not belong to member");
        }
        if (contestMapper.existsContestEntry(requestDTO.getContestId(), requestDTO.getWorkId())) {
            throw new IllegalStateException("contest entry already exists");
        }

        contestMapper.insertContestEntry(memberId, requestDTO);
        contestMapper.increaseContestEntryCount(requestDTO.getContestId());
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<ContestListResponseDTO> getHostedContestList(Long memberId) {
        List<ContestListResponseDTO> list = contestMapper.selectHostedContestList(memberId);
        return PageResponseDTO.<ContestListResponseDTO>builder()
                .content(list)
                .page(1)
                .size(list.size())
                .totalElements((long) list.size())
                .totalPages(list.isEmpty() ? 0 : 1)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<ContestListResponseDTO> getParticipatedContestList(Long memberId) {
        List<ContestListResponseDTO> list = contestMapper.selectParticipatedContestList(memberId);
        return PageResponseDTO.<ContestListResponseDTO>builder()
                .content(list)
                .page(1)
                .size(list.size())
                .totalElements((long) list.size())
                .totalPages(list.isEmpty() ? 0 : 1)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ContestWorkOptionDTO> getEntryWorkOptions(Long memberId) {
        return contestMapper.selectEntryWorkOptions(memberId);
    }

    public void updateContest(Long contestId, Long memberId, ContestUpdateRequestDTO requestDTO) {
        validateContestUpdateRequest(requestDTO);
        int updated = contestMapper.updateContest(contestId, memberId, requestDTO);
        if (updated == 0) {
            throw new IllegalArgumentException("contest not found or not owned by member");
        }
        contestMapper.deleteContestTagsByContestId(contestId);
        saveTags(contestId, requestDTO.getTagIds());
    }

    private void validateContestCreateRequest(ContestCreateRequestDTO requestDTO) {
        if (requestDTO == null) {
            throw new IllegalArgumentException("request is required");
        }
        validateRequiredFields(requestDTO.getTitle(), requestDTO.getOrganizer());
        validateDates(requestDTO.getEntryStart(), requestDTO.getEntryEnd(), requestDTO.getResultDate());
    }

    private void validateContestUpdateRequest(ContestUpdateRequestDTO requestDTO) {
        if (requestDTO == null) {
            throw new IllegalArgumentException("request is required");
        }
        validateRequiredFields(requestDTO.getTitle(), requestDTO.getOrganizer());
        validateDates(requestDTO.getEntryStart(), requestDTO.getEntryEnd(), requestDTO.getResultDate());
    }

    private void validateRequiredFields(String title, String organizer) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title is required");
        }
        if (organizer == null || organizer.isBlank()) {
            throw new IllegalArgumentException("organizer is required");
        }
    }

    private void saveTags(Long contestId, List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) {
            return;
        }
        for (Long tagId : tagIds) {
            contestMapper.insertContestTag(contestId, tagId);
        }
    }

    private void validateDates(java.time.LocalDate entryStart, java.time.LocalDate entryEnd, java.time.LocalDate resultDate) {
        if (entryStart == null || entryEnd == null) {
            throw new IllegalArgumentException("entry period is required");
        }
        if (entryStart.isAfter(entryEnd)) {
            throw new IllegalArgumentException("entry period is invalid");
        }
        if (resultDate != null && resultDate.isBefore(entryEnd)) {
            throw new IllegalArgumentException("result date is invalid");
        }
    }
}
