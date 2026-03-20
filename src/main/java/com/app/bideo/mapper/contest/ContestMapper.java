package com.app.bideo.mapper.contest;

import com.app.bideo.dto.contest.ContestDetailResponseDTO;
import com.app.bideo.dto.contest.ContestCreateRequestDTO;
import com.app.bideo.dto.contest.ContestEntryResponseDTO;
import com.app.bideo.dto.contest.ContestListResponseDTO;
import com.app.bideo.dto.contest.ContestSearchDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ContestMapper {

    List<ContestListResponseDTO> selectContestList(ContestSearchDTO searchDTO);

    int selectContestCount(ContestSearchDTO searchDTO);

    ContestDetailResponseDTO selectContestDetail(@Param("id") Long id);

    List<ContestEntryResponseDTO> selectContestEntryList(@Param("contestId") Long contestId);

    void insertContest(@Param("memberId") Long memberId, @Param("contest") ContestCreateRequestDTO contest);

    List<ContestListResponseDTO> selectHostedContestList(@Param("memberId") Long memberId);

    List<ContestListResponseDTO> selectParticipatedContestList(@Param("memberId") Long memberId);
}
