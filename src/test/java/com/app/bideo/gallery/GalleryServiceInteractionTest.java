package com.app.bideo.gallery;

import com.app.bideo.dto.gallery.GalleryDetailResponseDTO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.interaction.BookmarkDAO;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.common.S3FileService;
import com.app.bideo.service.gallery.GalleryService;
import com.app.bideo.service.interaction.CommentService;
import com.app.bideo.service.notification.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.BDDMockito.given;

class GalleryServiceInteractionTest {

    private GalleryDAO galleryDAO;
    private BookmarkDAO bookmarkDAO;
    private GalleryService galleryService;

    @BeforeEach
    void setUp() {
        galleryDAO = Mockito.mock(GalleryDAO.class);
        bookmarkDAO = Mockito.mock(BookmarkDAO.class);
        galleryService = new GalleryService(
                galleryDAO,
                Mockito.mock(WorkDAO.class),
                bookmarkDAO,
                Mockito.mock(CommentService.class),
                Mockito.mock(NotificationService.class),
                Mockito.mock(S3FileService.class)
        );
    }

    @Test
    void writeCommentRejectsWhenGalleryDisablesComments() {
        given(galleryDAO.findById(9L)).willReturn(Optional.of(
                GalleryDetailResponseDTO.builder()
                        .id(9L)
                        .memberId(1L)
                        .allowComment(false)
                        .build()
        ));

        assertThrows(IllegalStateException.class, () -> galleryService.writeComment(9L, 3L, "안녕하세요"));
    }

    @Test
    void getGalleryDetailDefaultsBookmarkStateForAnonymousViewer() {
        given(galleryDAO.findById(7L)).willReturn(Optional.of(
                GalleryDetailResponseDTO.builder()
                        .id(7L)
                        .memberId(1L)
                        .allowComment(true)
                        .build()
        ));
        given(galleryDAO.findTagsByGalleryId(7L)).willReturn(List.of());

        GalleryDetailResponseDTO detail = galleryService.getGalleryDetail(7L);

        assertFalse(Boolean.TRUE.equals(detail.getIsBookmarked()));
    }
}
