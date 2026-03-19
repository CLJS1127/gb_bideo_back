package com.app.bideo.dto.message;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponseDTO {
    private Long id;
    private Long senderId;
    private String senderNickname;
    private String senderProfileImage;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdDatetime;
}
