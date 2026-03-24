package com.app.bideo.service.gallery;

import com.app.bideo.dto.gallery.GalleryCreateRequestDTO;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.work.WorkDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class GalleryService {

    private static final Path GALLERY_UPLOAD_DIR = Paths.get("src", "main", "resources", "static", "uploads", "gallery");

    private final GalleryDAO galleryDAO;
    private final WorkDAO workDAO;

    // 예술관 등록
    public void write(Long memberId, GalleryCreateRequestDTO requestDTO, MultipartFile coverFile) {
        requestDTO.setMemberId(resolveMemberId(memberId));
        requestDTO.setCoverImage(saveCoverImage(coverFile));
        requestDTO.setAllowComment(requestDTO.getAllowComment() != null ? requestDTO.getAllowComment() : true);
        requestDTO.setShowSimilar(requestDTO.getShowSimilar() != null ? requestDTO.getShowSimilar() : true);
        galleryDAO.save(requestDTO);
    }

    // 프로필 하이라이트용 예술관 목록 조회
    @Transactional(readOnly = true)
    public List<GalleryListResponseDTO> getProfileGalleries() {
        return galleryDAO.findAllByMemberId(resolveMemberId(null));
    }

    private Long resolveMemberId(Long memberId) {
        if (memberId != null) {
            return memberId;
        }

        return workDAO.findFirstMemberId()
                .orElseThrow(() -> new IllegalStateException("no member available"));
    }

    private String saveCoverImage(MultipartFile coverFile) {
        if (coverFile == null || coverFile.isEmpty()) {
            throw new IllegalArgumentException("cover image is required");
        }

        if (coverFile.getContentType() == null || !coverFile.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("image file only");
        }

        try {
            Files.createDirectories(GALLERY_UPLOAD_DIR);

            String originalName = coverFile.getOriginalFilename() != null ? coverFile.getOriginalFilename() : "gallery_image";
            String savedName = UUID.randomUUID() + "_" + originalName.replace(" ", "_");
            Path savedPath = GALLERY_UPLOAD_DIR.resolve(savedName);

            Files.copy(coverFile.getInputStream(), savedPath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/gallery/" + savedName;
        } catch (IOException e) {
            throw new RuntimeException("gallery image upload failed", e);
        }
    }
}
