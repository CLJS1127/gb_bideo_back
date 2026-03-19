package com.app.bideo.dto.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageRequestDTO {
    private Integer page;
    private Integer size;
    private String sort;
    private String order;
}
