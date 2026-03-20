package com.app.bideo.mapper.gallery;

import com.app.bideo.dto.gallery.GalleryCreateRequestDTO;
import com.app.bideo.dto.gallery.GalleryListResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GalleryMapper {

    void insertGallery(GalleryCreateRequestDTO galleryCreateRequestDTO);

    List<GalleryListResponseDTO> selectGalleryListByMemberId(@Param("memberId") Long memberId);

    void insertGalleryWork(@Param("galleryId") Long galleryId, @Param("workId") Long workId);

    int deleteGalleryWorkByWorkId(@Param("workId") Long workId);

    Long selectGalleryIdByWorkId(@Param("workId") Long workId);

    void refreshGalleryWorkCount(@Param("galleryId") Long galleryId);
}
