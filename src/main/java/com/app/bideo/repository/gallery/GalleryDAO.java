package com.app.bideo.repository.gallery;

import com.app.bideo.dto.gallery.GalleryCreateRequestDTO;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.gallery.GalleryUpdateRequestDTO;
import com.app.bideo.mapper.gallery.GalleryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class GalleryDAO {

    private final GalleryMapper galleryMapper;

    public void save(GalleryCreateRequestDTO galleryCreateRequestDTO) {
        galleryMapper.insertGallery(galleryCreateRequestDTO);
    }

    public List<GalleryListResponseDTO> findAllByMemberId(Long memberId) {
        return galleryMapper.selectGalleryListByMemberId(memberId);
    }

    public Optional<Long> findMemberIdById(Long id) {
        return Optional.ofNullable(galleryMapper.selectGalleryMemberId(id));
    }

    public void update(Long id, GalleryUpdateRequestDTO galleryUpdateRequestDTO) {
        if (galleryMapper.updateGallery(id, galleryUpdateRequestDTO) == 0) {
            throw new IllegalArgumentException("gallery not found");
        }
    }

    public void delete(Long id) {
        if (galleryMapper.softDeleteGallery(id) == 0) {
            throw new IllegalArgumentException("gallery not found");
        }
    }

    public void saveWorkLink(Long galleryId, Long workId) {
        galleryMapper.insertGalleryWork(galleryId, workId);
    }

    public void deleteWorkLinkByWorkId(Long workId) {
        galleryMapper.deleteGalleryWorkByWorkId(workId);
    }

    public Optional<Long> findGalleryIdByWorkId(Long workId) {
        return Optional.ofNullable(galleryMapper.selectGalleryIdByWorkId(workId));
    }

    public void updateWorkCount(Long galleryId) {
        galleryMapper.refreshGalleryWorkCount(galleryId);
    }
}
