package com.app.bideo.service.gallery;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.domain.interaction.CommentVO;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.gallery.GalleryCreateRequestDTO;
import com.app.bideo.dto.gallery.GalleryDetailResponseDTO;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.gallery.SearchGalleryCoverDataDTO;
import com.app.bideo.dto.gallery.SearchGalleryCoverResponseDTO;
import com.app.bideo.dto.gallery.SearchGallerySuggestionDTO;
import com.app.bideo.dto.gallery.GalleryUpdateRequestDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.interaction.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class GalleryService {

    private final GalleryDAO galleryDAO;
    private final WorkDAO workDAO;
    private final CommentService commentService;

    // 예술관 등록
    @CacheEvict(value = {"recommendedGalleries", "recommendedSearchGalleries"}, allEntries = true)
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
        List<GalleryListResponseDTO> galleries = galleryDAO.findAllByMemberId(resolveMemberId(null));
        Long memberId = resolveAuthenticatedMemberId();
        galleries.forEach(gallery -> gallery.setIsLiked(memberId != null && galleryDAO.existsLike(memberId, gallery.getId())));
        return galleries;
    }

    // 예술관 상세 조회
    @Transactional(readOnly = true)
    public GalleryDetailResponseDTO getGalleryDetail(Long id) {
        return galleryDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));
    }

    // 추천 예술관 (인기순)
    @Cacheable("recommendedGalleries")
    @Transactional(readOnly = true)
    public List<GalleryListResponseDTO> getRecommendedGalleries() {
        return galleryDAO.findRecommended();
    }

    @Cacheable("recommendedSearchGalleries")
    @Transactional(readOnly = true)
    public List<SearchGallerySuggestionDTO> getRecommendedSearchGalleries() {
        return galleryDAO.findRecommendedSearchGalleries().stream()
                .map(this::withSearchCoverUrl)
                .toList();
    }

    @Transactional(readOnly = true)
    public SearchGalleryCoverResponseDTO getSearchGalleryCover(Long id) {
        return galleryDAO.findSearchGalleryCover(id)
                .filter(data -> data.getCoverImage() != null && !data.getCoverImage().isBlank())
                .map(this::decodeSearchGalleryCover)
                .orElse(null);
    }

    @CacheEvict(value = {"recommendedGalleries", "recommendedSearchGalleries"}, allEntries = true)
    public void update(Long id, Long memberId, GalleryUpdateRequestDTO requestDTO, MultipartFile coverFile) {
        Long resolvedMemberId = resolveMemberId(memberId);
        validateGalleryOwner(id, resolvedMemberId);
        if (requestDTO.getTitle() == null || requestDTO.getTitle().trim().isBlank()) {
            throw new IllegalArgumentException("gallery title is required");
        }

        requestDTO.setTitle(requestDTO.getTitle().trim());
        requestDTO.setDescription(requestDTO.getDescription() == null ? "" : requestDTO.getDescription().trim());

        if (coverFile != null && !coverFile.isEmpty()) {
            requestDTO.setCoverImage(saveCoverImage(coverFile));
        }

        galleryDAO.update(id, requestDTO);
    }

    @CacheEvict(value = {"recommendedGalleries", "recommendedSearchGalleries"}, allEntries = true)
    public void delete(Long id, Long memberId) {
        Long resolvedMemberId = resolveMemberId(memberId);
        validateGalleryOwner(id, resolvedMemberId);
        List<Long> workIds = galleryDAO.findWorkIdsByGalleryId(id);

        workIds.forEach(workId -> {
            workDAO.deleteFilesByWorkId(workId);
            workDAO.deleteTagsByWorkId(workId);
            galleryDAO.deleteWorkLinkByWorkId(workId);
            workDAO.delete(workId);
        });

        galleryDAO.deleteWorkLinksByGalleryId(id);
        galleryDAO.delete(id);
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getComments(Long id) {
        galleryDAO.findMemberIdById(id)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));
        List<CommentResponseDTO> comments = galleryDAO.findCommentsByGalleryId(id);
        Long memberId = resolveAuthenticatedMemberId();
        comments.forEach(comment ->
                comment.setIsLiked(memberId != null && commentService.isLikedByCurrentMember(comment.getId()))
        );
        return comments;
    }

    public List<CommentResponseDTO> writeComment(Long galleryId, Long memberId, String content) {
        Long resolvedMemberId = resolveMemberId(memberId);
        galleryDAO.findMemberIdById(galleryId)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));

        String normalizedContent = content == null ? "" : content.trim();
        if (normalizedContent.isBlank()) {
            throw new IllegalArgumentException("comment content is empty");
        }

        galleryDAO.saveComment(
                CommentVO.builder()
                        .memberId(resolvedMemberId)
                        .targetType("GALLERY")
                        .targetId(galleryId)
                        .content(normalizedContent)
                        .isPinned(false)
                        .likeCount(0)
                        .build()
        );
        galleryDAO.increaseCommentCount(galleryId);
        return getComments(galleryId);
    }

    public LikeToggleResponseDTO toggleLike(Long galleryId, Long memberId) {
        Long resolvedMemberId = resolveMemberId(memberId);
        galleryDAO.findMemberIdById(galleryId)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));

        boolean liked = galleryDAO.existsLike(resolvedMemberId, galleryId);
        if (liked) {
            galleryDAO.deleteLike(resolvedMemberId, galleryId);
            galleryDAO.decreaseLikeCount(galleryId);
        } else {
            galleryDAO.saveLike(resolvedMemberId, galleryId);
            galleryDAO.increaseLikeCount(galleryId);
        }

        return LikeToggleResponseDTO.builder()
                .targetId(galleryId)
                .targetType("GALLERY")
                .likeCount(galleryDAO.findLikeCount(galleryId))
                .liked(!liked)
                .build();
    }

    private void validateGalleryOwner(Long galleryId, Long memberId) {
        Long ownerId = galleryDAO.findMemberIdById(galleryId)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));
        if (!ownerId.equals(memberId)) {
            throw new IllegalStateException("forbidden");
        }
    }

    private Long resolveMemberId(Long memberId) {
        if (memberId != null) {
            return memberId;
        }

        Long authenticatedMemberId = resolveAuthenticatedMemberId();
        if (authenticatedMemberId != null) {
            return authenticatedMemberId;
        }

        throw new IllegalStateException("login required");
    }

    private Long resolveAuthenticatedMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        return null;
    }

    private String saveCoverImage(MultipartFile coverFile) {
        if (coverFile == null || coverFile.isEmpty()) {
            throw new IllegalArgumentException("cover image is required");
        }

        if (coverFile.getContentType() == null || !coverFile.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("image file only");
        }

        try {
            String contentType = coverFile.getContentType() != null ? coverFile.getContentType() : "image/png";
            String base64 = Base64.getEncoder().encodeToString(coverFile.getBytes());
            return "data:" + contentType + ";base64," + base64;
        } catch (IOException e) {
            throw new RuntimeException("gallery image upload failed", e);
        }
    }

    private SearchGallerySuggestionDTO withSearchCoverUrl(SearchGallerySuggestionDTO dto) {
        return SearchGallerySuggestionDTO.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .hasCoverImage(dto.getHasCoverImage())
                .coverImageUrl(Boolean.TRUE.equals(dto.getHasCoverImage()) ? "/image/gallery-cover/" + dto.getId() : null)
                .build();
    }

    private SearchGalleryCoverResponseDTO decodeSearchGalleryCover(SearchGalleryCoverDataDTO data) {
        String raw = data.getCoverImage();
        if (!raw.startsWith("data:")) {
            throw new IllegalStateException("gallery cover image is not a data uri");
        }

        int commaIndex = raw.indexOf(',');
        if (commaIndex < 0) {
            throw new IllegalStateException("gallery cover image payload is invalid");
        }

        String metadata = raw.substring(5, commaIndex);
        String payload = raw.substring(commaIndex + 1);
        String contentType = metadata;
        if (metadata.contains(";")) {
            contentType = metadata.substring(0, metadata.indexOf(';'));
        }
        if (contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        byte[] bytes = metadata.contains(";base64")
                ? Base64.getDecoder().decode(payload)
                : payload.getBytes(StandardCharsets.UTF_8);

        return SearchGalleryCoverResponseDTO.builder()
                .contentType(contentType)
                .bytes(bytes)
                .cacheControl("public, max-age=300")
                .build();
    }
}
