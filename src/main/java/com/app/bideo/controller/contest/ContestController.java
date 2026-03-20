package com.app.bideo.controller.contest;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.dto.common.PageResponseDTO;
import com.app.bideo.dto.contest.ContestCreateRequestDTO;
import com.app.bideo.dto.contest.ContestDetailResponseDTO;
import com.app.bideo.dto.contest.ContestEntryResponseDTO;
import com.app.bideo.dto.contest.ContestListResponseDTO;
import com.app.bideo.dto.contest.ContestSearchDTO;
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
    public String detail(@PathVariable Long id, Model model) {
        ContestDetailResponseDTO contest = contestService.getContestDetail(id);
        List<ContestEntryResponseDTO> entries = contestService.getContestEntryList(id);
        model.addAttribute("contest", contest);
        model.addAttribute("entries", entries);
        return "contest/contest-detail";
    }

    @GetMapping("/register")
    public String register(Model model) {
        model.addAttribute("contestForm", new ContestCreateRequestDTO());
        return "contest/contest-register";
    }

    @PostMapping("/register")
    public String create(@ModelAttribute("contestForm") ContestCreateRequestDTO contestForm,
                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long contestId = contestService.createContest(userDetails.getId(), contestForm);
        return "redirect:/contest/detail/" + contestId;
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
}
