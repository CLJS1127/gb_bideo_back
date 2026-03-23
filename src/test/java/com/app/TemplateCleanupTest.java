package com.app;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

class TemplateCleanupTest {

    @Test
    void loginAndSignupStandaloneTemplatesAreRemovedWhileModalAssetsStayReferenced() throws IOException {
        assertFalse(resourceExists("templates/main/login.html"));
        assertFalse(resourceExists("templates/main/sign-up.html"));

        String mainTemplate = readResource("templates/main/main.html");
        String layoutTemplate = readResource("templates/common/layout.html");
        String introTemplate = readResource("templates/main/intro-main.html");

        assertTrue(mainTemplate.contains("layout:decorate=\"~{/common/layout}\""));

        assertTrue(layoutTemplate.contains("/css/main/modal-shared.css"));
        assertTrue(layoutTemplate.contains("/css/main/auth-modal.css"));
        assertTrue(layoutTemplate.contains("/css/main/signup-modal.css"));
        assertTrue(layoutTemplate.contains("/js/main/modal-shared.js"));
        assertTrue(layoutTemplate.contains("/js/main/auth-modal.js"));
        assertTrue(layoutTemplate.contains("/js/main/signup-modal.js"));

        assertTrue(introTemplate.contains("/css/main/modal-shared.css"));
        assertTrue(introTemplate.contains("/css/main/auth-modal.css"));
        assertTrue(introTemplate.contains("/css/main/signup-modal.css"));
        assertTrue(introTemplate.contains("/js/main/modal-shared.js"));
        assertTrue(introTemplate.contains("/js/main/auth-modal.js"));
        assertTrue(introTemplate.contains("/js/main/signup-modal.js"));
    }

    @Test
    void mainPageUsesDelegatedActionsInsteadOfInlineLocalFunctionHandlers() throws IOException {
        String mainTemplate = readResource("templates/main/main.html");
        String mainScript = readResource("static/js/main/main.js");
        String closeupScript = readResource("static/js/main/closeup.js");

        assertFalse(mainTemplate.contains("onclick=\"openImageLightbox()\""));
        assertFalse(mainTemplate.contains("onclick=\"toggleCloseupLike(this)\""));
        assertFalse(mainTemplate.contains("onclick=\"toggleCloseupShareMenu(event, this)\""));
        assertFalse(mainTemplate.contains("onclick=\"toggleCloseupMoreMenu(event, this)\""));
        assertFalse(mainTemplate.contains("onclick=\"focusCloseupDetails()\""));
        assertFalse(mainTemplate.contains("onclick=\"toggleSave(event, this)\""));
        assertFalse(mainTemplate.contains("onclick=\"toggleFollow(this)\""));
        assertFalse(mainTemplate.contains("onclick=\"toggleCloseupCollapsible(this)\""));

        assertFalse(mainScript.contains("onclick=\"openPinDetail(this)\""));
        assertFalse(mainScript.contains("onclick=\"toggleSave(event, this)\""));
        assertFalse(mainScript.contains("onclick=\"sharePinMenu(event, this)\""));
        assertFalse(mainScript.contains("onclick=\"morePinMenu(event, this)\""));
        assertFalse(mainScript.contains("onclick=\"event.stopPropagation(); removeRecentSearch(this)\""));

        assertFalse(closeupScript.contains("onclick=\"event.stopPropagation(); copyCloseupLink(this)\""));
        assertFalse(closeupScript.contains("onclick=\"toggleSend(this)\""));
        assertFalse(closeupScript.contains("onclick=\"toggleCommentLike(this)\""));
        assertFalse(closeupScript.contains("onclick=\"event.stopPropagation(); copyPinLink(this)\""));
        assertFalse(closeupScript.contains("onclick=\"event.stopPropagation(); hidePinCard(this)\""));

        assertTrue(mainTemplate.contains("data-action=\"open-image-lightbox\""));
        assertTrue(mainTemplate.contains("data-action=\"toggle-closeup-like\""));
        assertTrue(mainTemplate.contains("data-action=\"toggle-closeup-share\""));
        assertTrue(mainTemplate.contains("data-action=\"toggle-closeup-more\""));
        assertTrue(mainTemplate.contains("data-action=\"focus-closeup-details\""));
        assertTrue(mainTemplate.contains("data-action=\"toggle-closeup-save\""));
        assertTrue(mainTemplate.contains("data-action=\"toggle-follow\""));
        assertTrue(mainTemplate.contains("data-action=\"toggle-closeup-collapsible\""));

        assertTrue(mainScript.contains("data-action=\"open-pin-detail\""));
        assertTrue(mainScript.contains("data-action=\"toggle-pin-save\""));
        assertTrue(mainScript.contains("data-action=\"share-pin-menu\""));
        assertTrue(mainScript.contains("data-action=\"more-pin-menu\""));
        assertTrue(mainScript.contains("data-action=\"remove-recent-search\""));

        assertTrue(closeupScript.contains("data-action=\"copy-closeup-link\""));
        assertTrue(closeupScript.contains("data-action=\"toggle-send\""));
        assertTrue(closeupScript.contains("data-action=\"toggle-comment-like\""));
        assertTrue(closeupScript.contains("data-action=\"copy-pin-link\""));
        assertTrue(closeupScript.contains("data-action=\"hide-pin-card\""));
    }

    @Test
    void mainPageUsesExistingFallbackAssetsAndExportsCloseupAppendHook() throws IOException {
        String mainScript = readResource("static/js/main/main.js");
        String closeupScript = readResource("static/js/main/closeup.js");

        assertFalse(mainScript.contains("/images/BIDEO_LOGO/favi_bideo.png"));
        assertTrue(mainScript.contains("/images/BIDEO_LOGO/BIDEO_favicon.png"));
        assertTrue(mainScript.contains("window.appendCloseupPins"));
        assertTrue(closeupScript.contains("window.appendCloseupPins = appendCloseupPins"));
        assertTrue(closeupScript.contains("creatorAvatar.onerror"));
        assertTrue(closeupScript.contains("createAvatarDataUri"));
    }

    private boolean resourceExists(String path) {
        return new ClassPathResource(path).exists();
    }

    private String readResource(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        assertNotNull(resource);
        try (InputStream stream = resource.getInputStream()) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
