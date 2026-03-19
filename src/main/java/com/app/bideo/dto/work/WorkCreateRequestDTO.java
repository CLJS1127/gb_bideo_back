package com.app.bideo.dto.work;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkCreateRequestDTO {
    private String title;
    private String category;
    private String description;
    private Integer price;
    private String licenseType;
    private String licenseTerms;
    private Boolean isTradable;
    private Boolean allowComment;
    private Boolean showSimilar;
    private String linkUrl;
    private List<Long> tagIds;
    private List<WorkFileRequestDTO> files;
}
