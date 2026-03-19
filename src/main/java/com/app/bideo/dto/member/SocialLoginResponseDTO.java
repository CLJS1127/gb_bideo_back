package com.app.bideo.dto.member;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialLoginResponseDTO {
    private Long id;
    private String provider;
    private LocalDateTime connectedAt;
}
