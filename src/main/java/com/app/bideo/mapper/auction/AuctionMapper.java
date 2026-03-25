package com.app.bideo.mapper.auction;

import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.domain.auction.AuctionVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuctionMapper {

    void insertAuction(AuctionVO auctionVO);

    AuctionDetailResponseDTO selectActiveAuctionByWorkId(@Param("workId") Long workId);
}
