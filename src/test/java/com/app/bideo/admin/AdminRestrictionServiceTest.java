package com.app.bideo.admin;

import com.app.bideo.dto.admin.AdminRestrictionResponseDTO;
import com.app.bideo.dto.admin.AdminRestrictionSearchDTO;
import com.app.bideo.dto.admin.AdminRestrictionUpsertRequestDTO;
import com.app.bideo.dto.admin.AdminMemberDetailResponseDTO;
import com.app.bideo.repository.admin.AdminMemberDAO;
import com.app.bideo.repository.admin.AdminRestrictionDAO;
import com.app.bideo.service.admin.AdminRestrictionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class AdminRestrictionServiceTest {

    private AdminRestrictionDAO adminRestrictionDAO;
    private AdminMemberDAO adminMemberDAO;
    private AdminRestrictionService adminRestrictionService;

    @BeforeEach
    void setUp() {
        adminRestrictionDAO = Mockito.mock(AdminRestrictionDAO.class);
        adminMemberDAO = Mockito.mock(AdminMemberDAO.class);
        adminRestrictionService = new AdminRestrictionService(adminRestrictionDAO, adminMemberDAO);
        given(adminRestrictionDAO.findActiveByMemberId(any())).willReturn(Optional.empty());
        given(adminRestrictionDAO.findExpirableRestrictions()).willReturn(List.of());
        given(adminMemberDAO.findById(any())).willReturn(Optional.of(
                AdminMemberDetailResponseDTO.builder().id(1L).status("ACTIVE").build()
        ));
    }

    @Test
    void getRestrictions_returnsList() {
        AdminRestrictionSearchDTO searchDTO = new AdminRestrictionSearchDTO();
        AdminRestrictionResponseDTO dto = AdminRestrictionResponseDTO.builder()
                .id(1L)
                .memberId(3L)
                .memberNickname("blocked-user")
                .restrictionType("BLOCK")
                .status("ACTIVE")
                .build();
        given(adminRestrictionDAO.findAll(searchDTO)).willReturn(List.of(dto));

        List<AdminRestrictionResponseDTO> result = adminRestrictionService.getRestrictions(searchDTO);

        assertEquals(1, result.size());
        assertEquals("blocked-user", result.get(0).getMemberNickname());
    }

    @Test
    void createRestriction_block_updatesMemberToBanned() {
        AdminRestrictionUpsertRequestDTO requestDTO = AdminRestrictionUpsertRequestDTO.builder()
                .memberId(7L)
                .restrictionType("BLOCK")
                .reason("중대한 운영 정책 위반")
                .build();

        adminRestrictionService.createRestriction(requestDTO);

        verify(adminRestrictionDAO).insert(requestDTO);
        verify(adminMemberDAO).updateStatus(7L, "BANNED");
        assertEquals("ACTIVE", requestDTO.getPreviousMemberStatus());
    }

    @Test
    void createRestriction_limit_requiresEndDatetimeAndSuspendsMember() {
        AdminRestrictionUpsertRequestDTO requestDTO = AdminRestrictionUpsertRequestDTO.builder()
                .memberId(8L)
                .restrictionType("LIMIT")
                .reason("기간 제한 테스트")
                .endDatetime(LocalDateTime.of(2026, 4, 30, 0, 0))
                .build();

        adminRestrictionService.createRestriction(requestDTO);

        verify(adminRestrictionDAO).insert(requestDTO);
        verify(adminMemberDAO).updateStatus(8L, "SUSPENDED");
        assertEquals("ACTIVE", requestDTO.getPreviousMemberStatus());
    }

    @Test
    void createRestriction_limitWithoutEndDatetime_throwsException() {
        AdminRestrictionUpsertRequestDTO requestDTO = AdminRestrictionUpsertRequestDTO.builder()
                .memberId(8L)
                .restrictionType("LIMIT")
                .reason("기간 제한 테스트")
                .build();

        assertThrows(IllegalArgumentException.class, () -> adminRestrictionService.createRestriction(requestDTO));
        verify(adminRestrictionDAO, never()).insert(any());
        verify(adminMemberDAO, never()).updateStatus(any(), any());
    }

    @Test
    void updateRestriction_updatesMemberStatusFromPersistedType() {
        AdminRestrictionUpsertRequestDTO requestDTO = AdminRestrictionUpsertRequestDTO.builder()
                .memberId(11L)
                .restrictionType("LIMIT")
                .reason("제한 연장")
                .endDatetime(LocalDateTime.of(2026, 5, 10, 0, 0))
                .build();
        given(adminRestrictionDAO.findById(4L)).willReturn(java.util.Optional.of(
                AdminRestrictionResponseDTO.builder()
                        .id(4L)
                        .memberId(11L)
                        .restrictionType("LIMIT")
                        .status("ACTIVE")
                        .previousMemberStatus("ACTIVE")
                        .build()
        ));

        adminRestrictionService.updateRestriction(4L, requestDTO);

        verify(adminRestrictionDAO).update(eq(4L), eq(requestDTO));
        verify(adminMemberDAO).updateStatus(11L, "SUSPENDED");
    }

    @Test
    void releaseRestriction_restoresPreviousMemberStatus() {
        given(adminRestrictionDAO.findById(9L)).willReturn(java.util.Optional.of(
                AdminRestrictionResponseDTO.builder()
                        .id(9L)
                        .memberId(15L)
                        .restrictionType("BLOCK")
                        .status("ACTIVE")
                        .previousMemberStatus("BANNED")
                        .build()
        ));

        adminRestrictionService.releaseRestriction(9L);

        verify(adminRestrictionDAO).release(9L);
        verify(adminMemberDAO).updateStatus(15L, "BANNED");
    }

    @Test
    void getRestrictions_expiresFinishedLimitAndRestoresPreviousStatus() {
        AdminRestrictionSearchDTO searchDTO = new AdminRestrictionSearchDTO();
        AdminRestrictionResponseDTO expiredRestriction = AdminRestrictionResponseDTO.builder()
                .id(12L)
                .memberId(21L)
                .restrictionType("LIMIT")
                .status("ACTIVE")
                .previousMemberStatus("SUSPENDED")
                .build();
        given(adminRestrictionDAO.findExpirableRestrictions()).willReturn(List.of(expiredRestriction));
        given(adminRestrictionDAO.findAll(any())).willReturn(List.of());

        List<AdminRestrictionResponseDTO> result = adminRestrictionService.getRestrictions(searchDTO);

        assertTrue(result.isEmpty());
        assertEquals("ACTIVE", searchDTO.getStatus());
        verify(adminRestrictionDAO).expireExpiredRestrictions();
        verify(adminMemberDAO).updateStatus(21L, "SUSPENDED");
    }
}
