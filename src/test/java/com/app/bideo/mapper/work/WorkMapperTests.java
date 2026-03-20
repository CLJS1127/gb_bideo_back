package com.app.bideo.mapper.work;

import com.app.bideo.dto.work.WorkDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@Slf4j
@Transactional
@Commit
public class WorkMapperTests {

    @Autowired
    private WorkMapper workMapper;

    @Test
    public void testInsertWork() {
        String suffix = String.valueOf(System.currentTimeMillis());
        String email = "work-test-" + suffix + "@example.com";
        String nickname = "work_test_" + suffix;

        workMapper.insertTestMember(Map.of(
                "email", email,
                "loginId", "work_login_" + suffix,
                "password", "1234",
                "nickname", nickname,
                "role", "USER",
                "status", "ACTIVE"
        ));

        Long memberId = workMapper.selectMemberIdByEmail(email);

        WorkDTO workDTO = WorkDTO.builder()
                .memberId(memberId)
                .title("bideo test")
                .category("VIDEO")
                .description("mapper test")
                .price(1000)
                .licenseType("PERSONAL")
                .licenseTerms("test")
                .isTradable(true)
                .allowComment(true)
                .showSimilar(true)
                .linkUrl("https://example.com")
                .status("ACTIVE")
                .build();

        workMapper.insertWork(workDTO);

        assertNotNull(workDTO.getId());
        log.info("work id: {}", workDTO.getId());
    }
}
