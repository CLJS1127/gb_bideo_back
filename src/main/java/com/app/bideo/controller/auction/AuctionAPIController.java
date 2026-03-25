package com.app.bideo.controller.auction;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.auction.*;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.service.auction.AuctionService;
import com.app.bideo.service.auction.BidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionAPIController {

    private final AuctionService auctionService;
    private final BidService bidService;

    @GetMapping("/by-work/{workId}")
    public AuctionDetailResponseDTO detailByWorkId(@PathVariable Long workId) {
        return auctionService.getActiveAuctionByWorkId(workId);
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<AuctionListResponseDTO>> getAuctionList(AuctionSearchDTO searchDTO) {
        return ResponseEntity.ok(auctionService.getAuctionList(searchDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionDetailResponseDTO> getAuctionDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        return ResponseEntity.ok(auctionService.getAuctionDetail(id, memberId));
    }

    @PostMapping("/{id}/wishlist")
    public ResponseEntity<Map<String, Object>> toggleWishlist(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(auctionService.toggleWishlist(userDetails.getId(), id));
    }

    @PostMapping("/{id}/bids")
    public ResponseEntity<BidResponseDTO> placeBid(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody BidRequestDTO requestDTO) {
        requestDTO.setAuctionId(id);
        return ResponseEntity.ok(bidService.placeBid(userDetails.getId(), requestDTO));
    }

    @GetMapping("/{id}/bids")
    public ResponseEntity<List<BidResponseDTO>> getBids(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(bidService.getBidsByAuction(id, page));
    }
}
