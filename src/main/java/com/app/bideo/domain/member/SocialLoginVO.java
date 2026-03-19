package com.app.bideo.domain.member;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialLoginVO {
    private Long id;
    private Long memberId;
    private String provider;
    private String providerId;
    private LocalDateTime connectedAt;
}
