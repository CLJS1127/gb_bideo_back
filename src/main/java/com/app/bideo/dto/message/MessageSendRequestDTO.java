package com.app.bideo.dto.message;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageSendRequestDTO {
    private Long messageRoomId;
    private String content;
}
