package com.app.bideo.controller.auction;

import com.app.bideo.dto.auction.AuctionDetailResponseDTO;
import com.app.bideo.service.auction.AuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionAPIController {

    private final AuctionService auctionService;

    @GetMapping("/by-work/{workId}")
    public AuctionDetailResponseDTO detailByWorkId(@PathVariable Long workId) {
        return auctionService.getActiveAuctionByWorkId(workId);
    }
}
