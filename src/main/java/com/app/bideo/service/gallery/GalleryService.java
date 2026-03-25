package com.app.bideo.service.gallery;

import com.app.bideo.auth.member.CustomUserDetails;
import com.app.bideo.domain.gallery.GalleryTagVO;
import com.app.bideo.domain.interaction.CommentVO;
import com.app.bideo.dto.common.LikeToggleResponseDTO;
import com.app.bideo.dto.gallery.GalleryCreateRequestDTO;
import com.app.bideo.dto.gallery.GalleryDetailResponseDTO;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.gallery.GalleryUpdateRequestDTO;
import com.app.bideo.dto.interaction.CommentResponseDTO;
import com.app.bideo.repository.gallery.GalleryDAO;
import com.app.bideo.repository.work.WorkDAO;
import com.app.bideo.service.interaction.CommentService;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class GalleryService {

    private final GalleryDAO galleryDAO;
    private final WorkDAO workDAO;
    private final CommentService commentService;
    private final NotificationService notificationService;

    // 예술관 등록
    public void write(Long memberId, GalleryCreateRequestDTO requestDTO, MultipartFile coverFile) {
        requestDTO.setMemberId(resolveMemberId(memberId));
        requestDTO.setCoverImage(saveCoverImage(coverFile));
        requestDTO.setAllowComment(requestDTO.getAllowComment() != null ? requestDTO.getAllowComment() : true);
        requestDTO.setShowSimilar(requestDTO.getShowSimilar() != null ? requestDTO.getShowSimilar() : true);
        galleryDAO.save(requestDTO);
        saveTags(requestDTO.getId(), requestDTO.getTagIds(), requestDTO.getTagNames());
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
        GalleryDetailResponseDTO detail = galleryDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));
        detail.setTags(galleryDAO.findTagsByGalleryId(id));

        Long memberId = resolveAuthenticatedMemberId();
        detail.setIsLiked(memberId != null && galleryDAO.existsLike(memberId, id));
        return detail;
    }

    // 추천 예술관 (인기순)
    @Transactional(readOnly = true)
    public List<GalleryListResponseDTO> getRecommendedGalleries() {
        return galleryDAO.findRecommended();
    }

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
        galleryDAO.deleteTagsByGalleryId(id);
        saveTags(id, requestDTO.getTagIds(), requestDTO.getTagNames());
    }

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
        Long galleryOwnerId = galleryDAO.findMemberIdById(galleryId)
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

        notificationService.createNotification(
                galleryOwnerId, resolvedMemberId, "COMMENT", "GALLERY", galleryId,
                normalizedContent.length() > 50
                        ? normalizedContent.substring(0, 50) + "..."
                        : normalizedContent
        );

        return getComments(galleryId);
    }

    public LikeToggleResponseDTO toggleLike(Long galleryId, Long memberId) {
        Long resolvedMemberId = resolveMemberId(memberId);
        Long galleryOwnerId = galleryDAO.findMemberIdById(galleryId)
                .orElseThrow(() -> new IllegalArgumentException("gallery not found"));

        boolean liked = galleryDAO.existsLike(resolvedMemberId, galleryId);
        if (liked) {
            galleryDAO.deleteLike(resolvedMemberId, galleryId);
            galleryDAO.decreaseLikeCount(galleryId);
        } else {
            galleryDAO.saveLike(resolvedMemberId, galleryId);
            galleryDAO.increaseLikeCount(galleryId);
            notificationService.createNotification(
                    galleryOwnerId, resolvedMemberId, "LIKE", "GALLERY", galleryId,
                    "예술관에 좋아요를 눌렀습니다."
            );
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

    private void saveTags(Long galleryId, List<Long> tagIds, List<String> tagNames) {
        List<Long> resolvedTagIds = new ArrayList<>();
        if (tagIds != null) {
            resolvedTagIds.addAll(tagIds);
        }
        resolvedTagIds.addAll(resolveTagIds(tagNames));

        new LinkedHashSet<>(resolvedTagIds).forEach(tagId ->
                galleryDAO.saveTag(galleryId, tagId)
        );
    }

    private List<Long> resolveTagIds(List<String> tagNames) {
        List<String> safeTagNames = tagNames == null ? Collections.emptyList() : tagNames;

        return safeTagNames.stream()
                .map(this::normalizeTagName)
                .filter(Objects::nonNull)
                .distinct()
                .map(this::findOrCreateTagId)
                .toList();
    }

    private String normalizeTagName(String tagName) {
        if (tagName == null) {
            return null;
        }

        String normalized = tagName.trim();
        if (normalized.startsWith("#")) {
            normalized = normalized.substring(1).trim();
        }

        return normalized.isBlank() ? null : normalized;
    }

    private Long findOrCreateTagId(String tagName) {
        return galleryDAO.findTagIdByName(tagName)
                .orElseGet(() -> {
                    galleryDAO.saveTagName(tagName);
                    return galleryDAO.findTagIdByName(tagName)
                            .orElseThrow(() -> new IllegalStateException("tag save failed"));
                });
    }
}
