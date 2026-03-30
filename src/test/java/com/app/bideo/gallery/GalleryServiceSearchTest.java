package com.app.bideo.gallery;

import com.app.bideo.dto.gallery.SearchGalleryCoverDataDTO;
import com.app.bideo.dto.gallery.SearchGalleryCoverResponseDTO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.gallery.GalleryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.BDDMockito.given;

class GalleryServiceSearchTest {

    private GalleryDAO galleryDAO;
    private GalleryService galleryService;

<<<<<<< HEAD
//    @BeforeEach
//    void setUp() {
//        galleryDAO = Mockito.mock(GalleryDAO.class);
//        galleryService = new GalleryService(galleryDAO, Mockito.mock(WorkDAO.class));
//    }

//    @Test
//    void searchGalleryCoverDecodesStoredDataUri() {
//        byte[] imageBytes = "thumb-image".getBytes(StandardCharsets.UTF_8);
//        given(galleryDAO.findSearchGalleryCover(5L)).willReturn(Optional.of(
//                SearchGalleryCoverDataDTO.builder()
//                        .coverImage("data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes))
//                        .build()
//        ));
//
//        SearchGalleryCoverResponseDTO response = galleryService.getSearchGalleryCover(5L);
//
//        assertNotNull(response);
//        assertEquals("image/png", response.getContentType());
//        assertEquals("public, max-age=300", response.getCacheControl());
//        assertArrayEquals(imageBytes, response.getBytes());
//    }
=======
    @BeforeEach
    void setUp() {
        galleryDAO = Mockito.mock(GalleryDAO.class);
        galleryService = new GalleryService(
                galleryDAO,
                Mockito.mock(WorkDAO.class),
                Mockito.mock(CommentService.class),
                Mockito.mock(NotificationService.class)
        );
    }

    @Test
    void getGalleryDetailThrowsWhenGalleryDoesNotExist() {
        given(galleryDAO.findById(5L)).willReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> galleryService.getGalleryDetail(5L));
    }
>>>>>>> admin
}
