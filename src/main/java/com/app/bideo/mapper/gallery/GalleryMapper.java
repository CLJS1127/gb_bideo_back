package com.app.bideo.mapper.gallery;

import com.app.bideo.dto.gallery.GalleryCreateRequestDTO;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import com.app.bideo.dto.gallery.GalleryUpdateRequestDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GalleryMapper {

    void insertGallery(GalleryCreateRequestDTO galleryCreateRequestDTO);

    List<GalleryListResponseDTO> selectGalleryListByMemberId(@Param("memberId") Long memberId);

    Long selectGalleryMemberId(@Param("id") Long id);

    int updateGallery(@Param("id") Long id, @Param("gallery") GalleryUpdateRequestDTO galleryUpdateRequestDTO);

    int softDeleteGallery(@Param("id") Long id);

    void insertGalleryWork(@Param("galleryId") Long galleryId, @Param("workId") Long workId);

    int deleteGalleryWorkByWorkId(@Param("workId") Long workId);

    Long selectGalleryIdByWorkId(@Param("workId") Long workId);

    void refreshGalleryWorkCount(@Param("galleryId") Long galleryId);
}
