package com.app.bideo.controller.gallery;

import com.app.bideo.dto.gallery.GalleryCreateRequestDTO;
import com.app.bideo.dto.gallery.GalleryUpdateRequestDTO;
import com.app.bideo.service.gallery.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/galleries")
@RequiredArgsConstructor
public class GalleryAPIController {

    private final GalleryService galleryService;

    @PostMapping
    public void write(
            @RequestParam(required = false) Long memberId,
            @ModelAttribute GalleryCreateRequestDTO requestDTO,
            @RequestParam("coverFile") MultipartFile coverFile
    ) {
        galleryService.write(memberId, requestDTO, coverFile);
    }

    @PostMapping("/{id}/edit")
    public ResponseEntity<Void> update(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId,
            @ModelAttribute GalleryUpdateRequestDTO requestDTO,
            @RequestParam(required = false) MultipartFile coverFile
    ) {
        galleryService.update(id, memberId, requestDTO, coverFile);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam(required = false) Long memberId
    ) {
        galleryService.delete(id, memberId);
        return ResponseEntity.noContent().build();
    }
}
