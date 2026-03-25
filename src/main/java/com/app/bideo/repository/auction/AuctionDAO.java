package com.app.bideo.repository.auction;

import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.domain.auction.AuctionVO;
import com.app.bideo.mapper.auction.AuctionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AuctionDAO {

    private final AuctionMapper auctionMapper;

    public void save(AuctionVO auctionVO) {
        auctionMapper.insertAuction(auctionVO);
    }

    public Optional<AuctionDetailResponseDTO> findActiveByWorkId(Long workId) {
        return Optional.ofNullable(auctionMapper.selectActiveAuctionByWorkId(workId));
    }
}
