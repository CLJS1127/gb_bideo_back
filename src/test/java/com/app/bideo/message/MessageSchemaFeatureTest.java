package com.app.bideo.message;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertTrue;

class MessageSchemaFeatureTest {

    @Test
    void messageSchemaSupportsSoftDeleteReplyAndLikes() throws IOException {
        String runAll = readResource("sql/99_run_all.sql");
        String message = readResource("sql/tbl_message.sql");
        String messageLike = readResource("sql/tbl_message_like.sql");

        assertTrue(runAll.contains("tbl_message_like.sql"), "99_run_all.sql should include tbl_message_like.sql");
        assertTrue(message.contains("updated_datetime"), "tbl_message should have updated_datetime column");
        assertTrue(message.contains("deleted_datetime"), "tbl_message should have deleted_datetime column");
        assertTrue(message.contains("reply_to_message_id"), "tbl_message should have reply_to_message_id column");
        assertTrue(message.contains("like_count"), "tbl_message should have like_count column");
        assertTrue(messageLike.contains("message_id"), "tbl_message_like should reference message_id");
        assertTrue(messageLike.contains("member_id"), "tbl_message_like should reference member_id");
    }

    private String readResource(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        try (InputStream stream = resource.getInputStream()) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
