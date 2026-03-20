package com.app;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertTrue;

class ContestTemplateBindingTest {

    @Test
    void hostedContestTemplateUsesContestListModelForDynamicCards() throws IOException {
        String template = readResource("templates/contest/contestlist.html");

        assertTrue(template.contains("th:each=\"contest : ${contestList}\""));
        assertTrue(template.contains("th:href=\"@{|/contest/detail/${contest.id}|}\""));
        assertTrue(template.contains("th:text=\"${contest.title}\""));
        assertTrue(template.contains("th:text=\"${contest.organizer}\""));
        assertTrue(template.contains("th:text=\"${contest.entryCount}\""));
        assertTrue(template.contains("th:if=\"${#lists.isEmpty(contestList)}\""));
    }

    @Test
    void participatedContestTemplateUsesContestListModelForDynamicCards() throws IOException {
        String template = readResource("templates/contest/mycontests.html");

        assertTrue(template.contains("th:each=\"contest : ${contestList}\""));
        assertTrue(template.contains("th:href=\"@{|/contest/detail/${contest.id}|}\""));
        assertTrue(template.contains("th:text=\"${contest.title}\""));
        assertTrue(template.contains("th:text=\"${contest.organizer}\""));
        assertTrue(template.contains("th:text=\"${contest.entryCount}\""));
        assertTrue(template.contains("th:if=\"${#lists.isEmpty(contestList)}\""));
    }

    @Test
    void contestDetailTemplateUsesContestAndEntriesModels() throws IOException {
        String template = readResource("templates/contest/contest-detail.html");

        assertTrue(template.contains("th:src=\"${contest.coverImage"));
        assertTrue(template.contains("th:text=\"${contest.title}\""));
        assertTrue(template.contains("th:text=\"${contest.organizer}\""));
        assertTrue(template.contains("th:text=\"${contest.description}\""));
        assertTrue(template.contains("th:text=\"${contest.prizeInfo}\""));
        assertTrue(template.contains("th:each=\"entry : ${entries}\""));
        assertTrue(template.contains("th:text=\"${entry.workTitle}\""));
        assertTrue(template.contains("th:text=\"${entry.memberNickname}\""));
        assertTrue(template.contains("th:if=\"${#lists.isEmpty(entries)}\""));
    }

    private String readResource(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        try (InputStream stream = resource.getInputStream()) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
