package com.app.bideo.service.contest;

import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.contest.ContestCreateRequestDTO;
import com.app.bideo.dto.contest.ContestDetailResponseDTO;
import com.app.bideo.dto.contest.ContestEntryResponseDTO;
import com.app.bideo.dto.contest.ContestListResponseDTO;
import com.app.bideo.dto.contest.ContestSearchDTO;
import com.app.bideo.mapper.contest.ContestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContestService {

    private final ContestMapper contestMapper;

    public Long createContest(Long memberId, ContestCreateRequestDTO contestCreateRequestDTO) {
        contestMapper.insertContest(memberId, contestCreateRequestDTO);
        return contestCreateRequestDTO.getId();
    }

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

    public ContestDetailResponseDTO getContestDetail(Long id) {
        return contestMapper.selectContestDetail(id);
    }

    public List<ContestEntryResponseDTO> getContestEntryList(Long contestId) {
        return contestMapper.selectContestEntryList(contestId);
    }

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
}
