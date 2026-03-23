package com.app.bideo.contest;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.common.enumeration.MemberRole;
import com.app.bideo.common.enumeration.MemberStatus;
import com.app.bideo.controller.contest.ContestController;
import com.app.bideo.domain.member.MemberVO;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.contest.ContestCreateRequestDTO;
import com.app.bideo.dto.contest.ContestDetailResponseDTO;
import com.app.bideo.dto.contest.ContestEntryRequestDTO;
import com.app.bideo.dto.contest.ContestEntryResponseDTO;
import com.app.bideo.dto.contest.ContestListResponseDTO;
import com.app.bideo.dto.contest.ContestUpdateRequestDTO;
import com.app.bideo.dto.contest.ContestWorkOptionDTO;
import com.app.bideo.service.contest.ContestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.ui.ConcurrentModel;
import org.springframework.ui.Model;
import org.springframework.web.servlet.mvc.support.RedirectAttributesModelMap;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@SpringBootTest
class ContestControllerTest {

    private MockMvc mockMvc;
    private ContestService contestService;
    private ContestController contestController;

    @BeforeEach
    void setUp() {
        contestService = Mockito.mock(ContestService.class);
        contestController = new ContestController(contestService);
        mockMvc = MockMvcBuilders.standaloneSetup(contestController).build();
    }

    @Test
    void registerPageUsesContestRegisterTemplateWithEmptyFormObject() throws Exception {
        mockMvc.perform(get("/contest/register"))
                .andExpect(status().isOk())
                .andExpect(view().name("contest/contest-register"))
                .andExpect(model().attributeExists("contestForm"));
    }

    @Test
    void createContestRedirectsToDetailForAuthenticatedMember() throws Exception {
        given(contestService.createContest(eq(7L), any(ContestCreateRequestDTO.class))).willReturn(31L);

        ContestCreateRequestDTO requestDTO = ContestCreateRequestDTO.builder()
                .title("봄 공모전")
                .organizer("BIDEO")
                .category("영상")
                .region("서울")
                .description("설명")
                .coverImage("https://example.com/poster.png")
                .prizeInfo("100만원")
                .price(0)
                .build();
        Model model = new ConcurrentModel();

        String viewName = contestController.create(requestDTO, authenticatedPrincipal(7L), model);

        assertEquals("redirect:/contest/detail/31", viewName);

        verify(contestService).createContest(eq(7L), any(ContestCreateRequestDTO.class));
    }

    @Test
    void createContestReturnsRegisterTemplateWithErrorMessageWhenValidationFails() {
        ContestCreateRequestDTO requestDTO = ContestCreateRequestDTO.builder()
                .title("")
                .build();
        Model model = new ConcurrentModel();
        Mockito.doThrow(new IllegalArgumentException("title is required"))
                .when(contestService).createContest(7L, requestDTO);

        String viewName = contestController.create(requestDTO, authenticatedPrincipal(7L), model);

        assertEquals("contest/contest-register", viewName);
        assertEquals("title is required", model.getAttribute("errorMessage"));
        assertEquals(Boolean.FALSE, model.getAttribute("isEdit"));
    }

    @Test
    void myContestsUsesHostedContestTemplateAndModel() throws Exception {
        given(contestService.getHostedContestList(7L)).willReturn(pageResponse());

        Model model = new ConcurrentModel();

        String viewName = contestController.myContests(authenticatedPrincipal(7L), model);

        assertEquals("contest/contestlist", viewName);
        assertNotNull(model.getAttribute("contestList"));

        verify(contestService).getHostedContestList(7L);
    }

    @Test
    void myEntriesUsesParticipatedContestTemplateAndModel() throws Exception {
        given(contestService.getParticipatedContestList(7L)).willReturn(pageResponse());

        Model model = new ConcurrentModel();

        String viewName = contestController.myEntries(authenticatedPrincipal(7L), model);

        assertEquals("contest/mycontests", viewName);
        assertNotNull(model.getAttribute("contestList"));

        verify(contestService).getParticipatedContestList(7L);
    }

    @Test
    void detailUsesContestEntriesAndAvailableWorksModels() {
        given(contestService.getContestDetail(9L, 7L)).willReturn(ContestDetailResponseDTO.builder().id(9L).title("상세").build());
        given(contestService.getContestEntryList(9L)).willReturn(Collections.<ContestEntryResponseDTO>emptyList());
        given(contestService.getEntryWorkOptions(7L))
                .willReturn(List.of(ContestWorkOptionDTO.builder().id(3L).title("내 작품").build()));

        Model model = new ConcurrentModel();

        String viewName = contestController.detail(9L, authenticatedPrincipal(7L), model);

        assertEquals("contest/contest-detail", viewName);
        assertNotNull(model.getAttribute("contest"));
        assertNotNull(model.getAttribute("entries"));
        assertNotNull(model.getAttribute("availableWorks"));
        assertNotNull(model.getAttribute("entryForm"));
        assertEquals(Boolean.FALSE, model.getAttribute("isOwner"));
    }

    @Test
    void submitEntryRedirectsBackToContestDetail() {
        ContestEntryRequestDTO requestDTO = ContestEntryRequestDTO.builder()
                .workId(3L)
                .build();
        RedirectAttributesModelMap redirectAttributes = new RedirectAttributesModelMap();

        String viewName = contestController.submitEntry(9L, requestDTO, authenticatedPrincipal(7L), redirectAttributes);

        assertEquals("redirect:/contest/detail/9", viewName);
        verify(contestService).submitEntry(7L, requestDTO);
        assertEquals(9L, requestDTO.getContestId());
        assertEquals("출품이 완료되었습니다.", redirectAttributes.getFlashAttributes().get("successMessage"));
    }

    @Test
    void submitEntryRedirectsWithErrorMessageWhenServiceRejectsRequest() {
        ContestEntryRequestDTO requestDTO = ContestEntryRequestDTO.builder()
                .workId(3L)
                .build();
        RedirectAttributesModelMap redirectAttributes = new RedirectAttributesModelMap();
        Mockito.doThrow(new IllegalStateException("contest entry already exists"))
                .when(contestService).submitEntry(7L, requestDTO);

        String viewName = contestController.submitEntry(9L, requestDTO, authenticatedPrincipal(7L), redirectAttributes);

        assertEquals("redirect:/contest/detail/9", viewName);
        assertEquals("이미 참여한 작품입니다.", redirectAttributes.getFlashAttributes().get("errorMessage"));
    }

    @Test
    void editPageUsesRegisterTemplateWithExistingContestDataForOwner() {
        given(contestService.getContestDetail(9L, 7L)).willReturn(ContestDetailResponseDTO.builder()
                .id(9L)
                .memberId(7L)
                .title("기존 공모전")
                .organizer("BIDEO")
                .build());

        Model model = new ConcurrentModel();

        String viewName = contestController.edit(9L, authenticatedPrincipal(7L), model);

        assertEquals("contest/contest-register", viewName);
        assertNotNull(model.getAttribute("contestForm"));
        assertEquals(Boolean.TRUE, model.getAttribute("isEdit"));
        assertEquals(9L, model.getAttribute("contestId"));
    }

    @Test
    void updateContestRedirectsToDetailForOwner() {
        ContestUpdateRequestDTO requestDTO = ContestUpdateRequestDTO.builder()
                .title("수정 제목")
                .build();
        RedirectAttributesModelMap redirectAttributes = new RedirectAttributesModelMap();
        Model model = new ConcurrentModel();

        String viewName = contestController.update(9L, requestDTO, authenticatedPrincipal(7L), redirectAttributes, model);

        assertEquals("redirect:/contest/detail/9", viewName);
        verify(contestService).updateContest(9L, 7L, requestDTO);
        assertEquals("공모전이 수정되었습니다.", redirectAttributes.getFlashAttributes().get("successMessage"));
    }

    @Test
    void updateContestReturnsRegisterTemplateWithErrorMessageWhenValidationFails() {
        ContestUpdateRequestDTO requestDTO = ContestUpdateRequestDTO.builder()
                .title("")
                .build();
        RedirectAttributesModelMap redirectAttributes = new RedirectAttributesModelMap();
        Model model = new ConcurrentModel();
        Mockito.doThrow(new IllegalArgumentException("title is required"))
                .when(contestService).updateContest(9L, 7L, requestDTO);

        String viewName = contestController.update(9L, requestDTO, authenticatedPrincipal(7L), redirectAttributes, model);

        assertEquals("contest/contest-register", viewName);
        assertEquals("title is required", model.getAttribute("errorMessage"));
        assertEquals(Boolean.TRUE, model.getAttribute("isEdit"));
        assertEquals(9L, model.getAttribute("contestId"));
    }

    private PageResponseDTO<ContestListResponseDTO> pageResponse() {
        return PageResponseDTO.<ContestListResponseDTO>builder()
                .content(List.of(ContestListResponseDTO.builder().id(1L).title("테스트").build()))
                .page(1)
                .size(10)
                .totalElements(1L)
                .totalPages(1)
                .build();
    }

    private UsernamePasswordAuthenticationToken authenticatedUser(Long memberId) {
        MemberVO member = MemberVO.builder()
                .id(memberId)
                .email("contest@test.com")
                .password("pw")
                .nickname("contest-user")
                .role(MemberRole.USER)
                .status(MemberStatus.ACTIVE)
                .build();
        CustomUserDetails principal = new CustomUserDetails(member);
        return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    private CustomUserDetails authenticatedPrincipal(Long memberId) {
        return (CustomUserDetails) authenticatedUser(memberId).getPrincipal();
    }
}
