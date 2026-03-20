package com.app.bideo.controller.profile;

import com.app.bideo.service.gallery.GalleryService;
import com.app.bideo.service.work.WorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final WorkService workService;
    private final GalleryService galleryService;

    @GetMapping("/profile")
    public String profile(Model model) {
        model.addAttribute("works", workService.getProfileWorks());
        model.addAttribute("galleries", galleryService.getProfileGalleries());
        return "profile/profile";
    }
}
