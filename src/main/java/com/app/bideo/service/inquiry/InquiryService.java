package com.app.bideo.service.inquiry;

import com.app.bideo.domain.admin.InquiryVO;
import com.app.bideo.dto.admin.InquiryCreateRequestDTO;
import com.app.bideo.repository.inquiry.InquiryDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InquiryService {

    private final InquiryDAO inquiryDAO;

    public void createInquiry(Long memberId, InquiryCreateRequestDTO requestDTO) {
        InquiryVO inquiryVO = InquiryVO.builder()
                .memberId(memberId)
                .category(requestDTO.getCategory())
                .content(requestDTO.getContent())
                .status("PENDING")
                .build();

        inquiryDAO.save(inquiryVO);
    }
}
