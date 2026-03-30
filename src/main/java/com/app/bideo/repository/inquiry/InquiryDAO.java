package com.app.bideo.repository.inquiry;

import com.app.bideo.domain.admin.InquiryVO;
import com.app.bideo.mapper.inquiry.InquiryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class InquiryDAO {

    private final InquiryMapper inquiryMapper;

    public void save(InquiryVO inquiryVO) {
        inquiryMapper.insertInquiry(inquiryVO);
    }
}
