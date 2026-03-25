package com.app.bideo.service.auction;

import com.app.bideo.domain.auction.AuctionVO;
import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.dto.auction.AuctionListResponseDTO;
import com.app.bideo.dto.auction.AuctionSearchDTO;
import com.app.bideo.dto.auction.BidResponseDTO;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.repository.auction.AuctionDAO;
import com.app.bideo.repository.auction.BidDAO;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class AuctionService {

    private final AuctionDAO auctionDAO;
    private final BidDAO bidDAO;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public AuctionDetailResponseDTO getActiveAuctionByWorkId(Long workId) {
        return auctionDAO.findActiveByWorkId(workId)
                .orElseThrow(() -> new IllegalArgumentException("활성 경매를 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<AuctionListResponseDTO> getAuctionList(AuctionSearchDTO searchDTO) {
        if (searchDTO.getPage() == null) searchDTO.setPage(1);
        if (searchDTO.getSize() == null) searchDTO.setSize(20);

        List<AuctionListResponseDTO> content = auctionDAO.findAuctions(searchDTO);
        int total = auctionDAO.countAuctions(searchDTO);

        return PageResponseDTO.<AuctionListResponseDTO>builder()
                .content(content)
                .page(searchDTO.getPage())
                .size(searchDTO.getSize())
                .totalElements((long) total)
                .totalPages((int) Math.ceil((double) total / searchDTO.getSize()))
                .build();
    }

    @Transactional(readOnly = true)
    public AuctionDetailResponseDTO getAuctionDetail(Long auctionId, Long memberId) {
        return auctionDAO.findById(auctionId, memberId)
                .orElseThrow(() -> new IllegalArgumentException("경매를 찾을 수 없습니다."));
    }

    public Map<String, Object> toggleWishlist(Long memberId, Long auctionId) {
        boolean exists = auctionDAO.existsWishlist(memberId, auctionId);
        if (exists) {
            auctionDAO.deleteWishlist(memberId, auctionId);
        } else {
            auctionDAO.saveWishlist(memberId, auctionId);
        }
        return Map.of("wishlisted", !exists);
    }

    public void closeAuction(Long auctionId) {
        AuctionVO auction = auctionDAO.findRawById(auctionId);
        if (auction == null) {
            throw new IllegalArgumentException("경매를 찾을 수 없습니다.");
        }
        if (!"ACTIVE".equals(auction.getStatus())) {
            throw new IllegalStateException("이미 종료된 경매입니다.");
        }

        BidResponseDTO highestBid = bidDAO.findHighestBid(auctionId).orElse(null);
        if (highestBid != null) {
            auctionDAO.updateWinner(auctionId, highestBid.getMemberId(), highestBid.getBidPrice());

            notificationService.createNotification(
                    highestBid.getMemberId(), null, "AUCTION_END", "AUCTION",
                    auctionId, "축하합니다! 경매에서 낙찰되었습니다."
            );
            notificationService.createNotification(
                    auction.getSellerId(), null, "AUCTION_END", "AUCTION",
                    auctionId, "경매가 종료되어 낙찰자가 결정되었습니다."
            );
        } else {
            auctionDAO.updateStatus(auctionId, "CLOSED");

            notificationService.createNotification(
                    auction.getSellerId(), null, "AUCTION_END", "AUCTION",
                    auctionId, "경매가 입찰 없이 종료되었습니다."
            );
        }
    }
}
