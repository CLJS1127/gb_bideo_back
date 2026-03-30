package com.app.bideo.controller.customerservice;

import com.app.bideo.dto.admin.InquiryCreateRequestDTO;
import com.app.bideo.service.inquiry.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inquiry")
@RequiredArgsConstructor
public class InquiryAPIController {

    private final InquiryService inquiryService;

    @PostMapping
    public ResponseEntity<String> createInquiry(
            @RequestParam(required = false) Long memberId,
            @RequestBody InquiryCreateRequestDTO requestDTO
    ) {
        inquiryService.createInquiry(memberId, requestDTO);
        return ResponseEntity.ok("문의가 등록되었습니다.");
    }
}
