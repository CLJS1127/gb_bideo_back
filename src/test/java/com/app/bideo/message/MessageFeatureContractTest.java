package com.app.bideo.message;

import com.app.bideo.controller.message.MessageAPIController;
import com.app.bideo.dto.message.MessageResponseDTO;
import com.app.bideo.dto.message.MessageSendRequestDTO;
import com.app.bideo.service.message.MessageService;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class MessageFeatureContractTest {

    @Test
    void sendRequestSupportsReplyTargets() throws Exception {
        Field field = MessageSendRequestDTO.class.getDeclaredField("replyToMessageId");

        assertNotNull(field);
    }

    @Test
    void responseDtoExposesEditDeleteReplyAndLikeMetadata() throws Exception {
        for (String fieldName : new String[]{
                "updatedDatetime",
                "edited",
                "deleted",
                "replyToMessageId",
                "replyPreview",
                "replySenderNickname",
                "likeCount",
                "isLiked",
                "canEdit",
                "canDelete"
        }) {
            Field field = MessageResponseDTO.class.getDeclaredField(fieldName);
            assertNotNull(field, fieldName + " should exist on MessageResponseDTO");
        }
    }

    @Test
    void messageApiControllerExposesMutationEndpoints() throws Exception {
        Method updateMethod = Arrays.stream(MessageAPIController.class.getDeclaredMethods())
                .filter(method -> method.getName().equals("updateMessage"))
                .findFirst()
                .orElseThrow();
        Method deleteMethod = Arrays.stream(MessageAPIController.class.getDeclaredMethods())
                .filter(method -> method.getName().equals("deleteMessage"))
                .findFirst()
                .orElseThrow();
        Method likeMethod = Arrays.stream(MessageAPIController.class.getDeclaredMethods())
                .filter(method -> method.getName().equals("toggleMessageLike"))
                .findFirst()
                .orElseThrow();

        assertNotNull(updateMethod.getAnnotation(PatchMapping.class));
        assertNotNull(deleteMethod.getAnnotation(DeleteMapping.class));
        assertNotNull(likeMethod.getAnnotation(PostMapping.class));
    }

    @Test
    void messageServiceExposesMutationWorkflows() throws Exception {
        Method updateMethod = MessageService.class.getDeclaredMethod(
                "updateMessage", Long.class, Long.class, Long.class, String.class
        );
        Method deleteMethod = MessageService.class.getDeclaredMethod(
                "deleteMessage", Long.class, Long.class, Long.class
        );
        Method likeMethod = MessageService.class.getDeclaredMethod(
                "toggleMessageLike", Long.class, Long.class, Long.class
        );

        assertNotNull(updateMethod);
        assertNotNull(deleteMethod);
        assertNotNull(likeMethod);
    }
}
