package com.app.bideo.controller.member;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
    @GetMapping("/")
    public String root(Authentication authentication) {
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            return "main/main";
        }
        return "main/intro-main";
    }

    @GetMapping({"/main/intro-main", "/main/main"})
    public String redirectMainRoutes() {
        return "redirect:/";
    }

    @GetMapping("/error-page")
    public String errorPage() {
        return "error/error";
    }
}
