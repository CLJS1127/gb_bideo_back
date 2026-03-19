package com.app.bideo.domain.message;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageVO {
    private Long id;
    private Long messageRoomId;
    private Long senderId;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdDatetime;
}
