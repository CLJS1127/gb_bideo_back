package com.app.bideo.domain.admin;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryVO {
    private Long id;
    private Long memberId;
    private String category;
    private String content;
    private String reply;
    private String status;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
