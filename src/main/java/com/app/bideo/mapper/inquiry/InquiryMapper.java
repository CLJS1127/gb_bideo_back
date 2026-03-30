package com.app.bideo.mapper.inquiry;

import com.app.bideo.domain.admin.InquiryVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface InquiryMapper {
    void insertInquiry(InquiryVO inquiryVO);
}
