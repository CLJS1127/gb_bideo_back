package com.app.bideo.dto.contest;

import com.app.bideo.dto.common.PageRequestDTO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContestSearchDTO extends PageRequestDTO {
    private String keyword;
    private String category;
    private String region;
    private String status;
}
