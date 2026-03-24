package com.app.bideo.dto.gallery;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryListResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String coverImage;
    private String memberNickname;
    private Integer workCount;
    private Integer likeCount;
    private Integer viewCount;
    private LocalDateTime createdDatetime;
}
