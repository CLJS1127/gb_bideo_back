package com.app.bideo.gallery;

import com.app.bideo.controller.gallery.GalleryAPIController;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.gallery.GalleryDetailResponseDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import com.app.bideo.service.gallery.GalleryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
    void galleryEndpointsExposeCurrentDetailAndInteractionPayloads() throws Exception {
        given(galleryService.getGalleryDetail(7L)).willReturn(
                GalleryDetailResponseDTO.builder()
                        .id(7L)
                        .title("봄 전시")
                        .isLiked(true)
                        .isBookmarked(false)
                        .commentCount(2)
                        .build()
        );
        given(galleryService.getComments(7L)).willReturn(List.of(
                CommentResponseDTO.builder()
                        .id(99L)
                        .memberNickname("curator")
                        .content("첫 댓글")
                        .build()
        ));
        given(galleryService.toggleLike(7L, null)).willReturn(
                LikeToggleResponseDTO.builder()
                        .targetId(7L)
                        .targetType("GALLERY")
                        .liked(true)
                        .likeCount(14)
                        .build()
        );
        given(galleryService.writeComment(eq(7L), isNull(), eq("안녕하세요"))).willReturn(List.of(
                CommentResponseDTO.builder()
                        .id(100L)
                        .memberNickname("guest")
                        .content("안녕하세요")
                        .build()
        ));

        mockMvc.perform(get("/api/galleries/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.title").value("봄 전시"))
                .andExpect(jsonPath("$.isLiked").value(true))
                .andExpect(jsonPath("$.isBookmarked").value(false))
                .andExpect(jsonPath("$.commentCount").value(2));

        mockMvc.perform(get("/api/galleries/7/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(99))
                .andExpect(jsonPath("$[0].memberNickname").value("curator"))
                .andExpect(jsonPath("$[0].content").value("첫 댓글"));

        mockMvc.perform(post("/api/galleries/7/likes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(true))
                .andExpect(jsonPath("$.likeCount").value(14));

        mockMvc.perform(post("/api/galleries/7/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"targetType":"GALLERY","targetId":7,"content":"안녕하세요"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].content").value("안녕하세요"));
    }
}
