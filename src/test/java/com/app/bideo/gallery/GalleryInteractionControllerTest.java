package com.app.bideo.gallery;

import com.app.bideo.controller.gallery.GalleryAPIController;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.service.gallery.GalleryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GalleryInteractionControllerTest {

    private MockMvc mockMvc;
    private GalleryService galleryService;

    @BeforeEach
    void setUp() {
        galleryService = Mockito.mock(GalleryService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new GalleryAPIController(galleryService)).build();
    }

    @Test
    void galleryLikeEndpointExposesMinimalStatePayload() throws Exception {
        given(galleryService.toggleLike(7L, 33L)).willReturn(
                LikeToggleResponseDTO.builder()
                        .targetId(7L)
                        .targetType("GALLERY")
                        .liked(true)
                        .likeCount(14)
                        .build()
        );

        mockMvc.perform(post("/api/galleries/7/likes").param("memberId", "33"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.targetId").value(7))
                .andExpect(jsonPath("$.targetType").value("GALLERY"))
                .andExpect(jsonPath("$.liked").value(true))
                .andExpect(jsonPath("$.likeCount").value(14));
    }
}
