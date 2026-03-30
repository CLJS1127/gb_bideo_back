package com.app.bideo.admin;

import com.app.bideo.dto.admin.AdminRestrictionResponseDTO;
import com.app.bideo.dto.admin.AdminRestrictionSearchDTO;
import com.app.bideo.dto.admin.AdminRestrictionUpsertRequestDTO;
import com.app.bideo.mapper.admin.AdminRestrictionMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Slf4j
@Transactional
class AdminRestrictionMapperTest {

    @Autowired
    private AdminRestrictionMapper adminRestrictionMapper;

    @Test
    void selectRestrictionList_returnsAll() {
        AdminRestrictionSearchDTO searchDTO = new AdminRestrictionSearchDTO();
        searchDTO.setPage(1);
        searchDTO.setSize(20);

        List<AdminRestrictionResponseDTO> result = adminRestrictionMapper.selectRestrictionList(searchDTO);

        assertNotNull(result);
        log.info("restriction list size: {}", result.size());
    }

    @Test
    void insertUpdateAndReleaseRestriction_persistsLifecycle() {
        AdminRestrictionUpsertRequestDTO requestDTO = AdminRestrictionUpsertRequestDTO.builder()
                .memberId(1L)
                .restrictionType("LIMIT")
                .reason("테스트 제한")
                .endDatetime(LocalDateTime.of(2026, 4, 15, 0, 0))
                .previousMemberStatus("ACTIVE")
                .build();

        adminRestrictionMapper.insertRestriction(requestDTO);

        assertNotNull(requestDTO.getId());

        requestDTO.setReason("테스트 제한 수정");
        requestDTO.setEndDatetime(LocalDateTime.of(2026, 4, 20, 0, 0));
        adminRestrictionMapper.updateRestriction(requestDTO.getId(), requestDTO);
        adminRestrictionMapper.releaseRestriction(requestDTO.getId());

        AdminRestrictionResponseDTO result = adminRestrictionMapper.selectRestrictionDetail(requestDTO.getId());

        assertNotNull(result);
        assertTrue("RELEASED".equals(result.getStatus()) || "EXPIRED".equals(result.getStatus()));
    }
}
