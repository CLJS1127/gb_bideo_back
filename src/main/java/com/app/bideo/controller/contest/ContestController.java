package com.app.bideo.controller.contest;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.contest.ContestCreateRequestDTO;
import com.app.bideo.dto.contest.ContestDetailResponseDTO;
import com.app.bideo.dto.contest.ContestEntryRequestDTO;
import com.app.bideo.dto.contest.ContestEntryResponseDTO;
import com.app.bideo.dto.contest.ContestListResponseDTO;
import com.app.bideo.dto.contest.ContestSearchDTO;
import com.app.bideo.dto.contest.ContestUpdateRequestDTO;
import com.app.bideo.dto.contest.ContestWorkOptionDTO;
import com.app.bideo.service.contest.ContestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/contest")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;

    @GetMapping("/list")
    public String list(@ModelAttribute ContestSearchDTO searchDTO, Model model) {
        PageResponseDTO<ContestListResponseDTO> result = contestService.getContestList(searchDTO);
        model.addAttribute("contestList", result.getContent());
        model.addAttribute("page", result);
        model.addAttribute("search", searchDTO);
        return "contest/contest-list";
    }

    @GetMapping("/detail/{id}")
    public String detail(@PathVariable Long id,
                         @AuthenticationPrincipal CustomUserDetails userDetails,
                         Model model) {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        ContestDetailResponseDTO contest = contestService.getContestDetail(id, memberId);
        List<ContestEntryResponseDTO> entries = contestService.getContestEntryList(id);
        model.addAttribute("contest", contest);
        model.addAttribute("entries", entries);
        model.addAttribute("entryForm", ContestEntryRequestDTO.builder().contestId(id).build());
        model.addAttribute("isOwner", userDetails != null && contest.getMemberId() != null && contest.getMemberId().equals(userDetails.getId()));
        if (userDetails != null) {
            List<ContestWorkOptionDTO> availableWorks = contestService.getEntryWorkOptions(userDetails.getId());
            model.addAttribute("availableWorks", availableWorks);
        }
        return "contest/contest-detail";
    }

    @GetMapping("/register")
    public String register(Model model) {
        model.addAttribute("contestForm", new ContestCreateRequestDTO());
        model.addAttribute("isEdit", false);
        return "contest/contest-register";
    }

    @PostMapping("/register")
    public String create(@ModelAttribute("contestForm") ContestCreateRequestDTO contestForm,
                         @AuthenticationPrincipal CustomUserDetails userDetails,
                         Model model) {
        try {
            Long contestId = contestService.createContest(userDetails.getId(), contestForm);
            return "redirect:/contest/detail/" + contestId;
        } catch (IllegalArgumentException e) {
            model.addAttribute("contestForm", contestForm);
            model.addAttribute("isEdit", false);
            model.addAttribute("errorMessage", e.getMessage());
            return "contest/contest-register";
        }
    }

    @GetMapping("/my-contests")
    public String myContests(@AuthenticationPrincipal CustomUserDetails userDetails, Model model) {
        PageResponseDTO<ContestListResponseDTO> result = contestService.getHostedContestList(userDetails.getId());
        model.addAttribute("contestList", result.getContent());
        model.addAttribute("page", result);
        return "contest/contestlist";
    }

    @GetMapping("/my-entries")
    public String myEntries(@AuthenticationPrincipal CustomUserDetails userDetails, Model model) {
        PageResponseDTO<ContestListResponseDTO> result = contestService.getParticipatedContestList(userDetails.getId());
        model.addAttribute("contestList", result.getContent());
        model.addAttribute("page", result);
        return "contest/mycontests";
    }

    @GetMapping("/{id}/edit")
    public String edit(@PathVariable Long id,
                       @AuthenticationPrincipal CustomUserDetails userDetails,
                       Model model) {
        Long memberId = userDetails != null ? userDetails.getId() : null;
        ContestDetailResponseDTO contest = contestService.getContestDetail(id, memberId);
        if (userDetails == null || contest.getMemberId() == null || !contest.getMemberId().equals(userDetails.getId())) {
            return "redirect:/contest/detail/" + id;
        }

        ContestUpdateRequestDTO contestForm = ContestUpdateRequestDTO.builder()
                .title(contest.getTitle())
                .organizer(contest.getOrganizer())
                .category(contest.getCategory())
                .region(contest.getRegion())
                .description(contest.getDescription())
                .coverImage(contest.getCoverImage())
                .entryStart(contest.getEntryStart())
                .entryEnd(contest.getEntryEnd())
                .resultDate(contest.getResultDate())
                .prizeInfo(contest.getPrizeInfo())
                .price(contest.getPrice())
                .status(contest.getStatus())
                .build();

        model.addAttribute("contestForm", contestForm);
        model.addAttribute("isEdit", true);
        model.addAttribute("contestId", id);
        return "contest/contest-register";
    }

    @PostMapping("/{id}/entries")
    public String submitEntry(@PathVariable Long id,
                              @ModelAttribute("entryForm") ContestEntryRequestDTO entryForm,
                              @AuthenticationPrincipal CustomUserDetails userDetails,
                              RedirectAttributes redirectAttributes) {
        entryForm.setContestId(id);
        try {
            contestService.submitEntry(userDetails.getId(), entryForm);
            redirectAttributes.addFlashAttribute("successMessage", "출품이 완료되었습니다.");
        } catch (IllegalStateException e) {
            redirectAttributes.addFlashAttribute("errorMessage", "이미 참여한 작품입니다.");
        } catch (IllegalArgumentException e) {
            redirectAttributes.addFlashAttribute("errorMessage", "내 작품만 출품할 수 있습니다.");
        }
        return "redirect:/contest/detail/" + id;
    }

    @PostMapping("/{id}/edit")
    public String update(@PathVariable Long id,
                         @ModelAttribute("contestForm") ContestUpdateRequestDTO contestForm,
                         @AuthenticationPrincipal CustomUserDetails userDetails,
                         RedirectAttributes redirectAttributes,
                         Model model) {
        try {
            contestService.updateContest(id, userDetails.getId(), contestForm);
            redirectAttributes.addFlashAttribute("successMessage", "공모전이 수정되었습니다.");
            return "redirect:/contest/detail/" + id;
        } catch (IllegalArgumentException e) {
            model.addAttribute("contestForm", contestForm);
            model.addAttribute("isEdit", true);
            model.addAttribute("contestId", id);
            model.addAttribute("errorMessage", e.getMessage());
            return "contest/contest-register";
        }
    }
}
