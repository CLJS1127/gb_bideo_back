package com.app.bideo.dto.work;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkListResponseDTO {
    private Long id;
    private String title;
    private String category;
    private Integer price;
    private String memberNickname;
    private String thumbnailUrl;
    private Integer viewCount;
    private Integer likeCount;
    private LocalDateTime createdDatetime;
}
