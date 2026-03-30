package com.app.bideo.common;

import com.app.bideo.controller.common.SearchAPIController;
import com.app.bideo.dto.common.TrendingKeywordDTO;
import com.app.bideo.service.common.SearchHistoryService;
import com.app.bideo.service.gallery.GalleryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SearchApiControllerTest {

    private MockMvc mockMvc;
    private SearchHistoryService searchHistoryService;
    private GalleryService galleryService;

    @BeforeEach
    void setUp() {
        searchHistoryService = Mockito.mock(SearchHistoryService.class);
        galleryService = Mockito.mock(GalleryService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(
                new SearchAPIController(searchHistoryService, galleryService)
        ).build();
    }

    @Test
    void trendingKeywordsExposeLightweightPayload() throws Exception {
        given(searchHistoryService.getTrendingKeywords()).willReturn(List.of(
                TrendingKeywordDTO.builder()
                        .keyword("봄 전시")
                        .searchCount(7)
                        .build()
        ));

        mockMvc.perform(get("/api/search/trending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].keyword").value("봄 전시"))
                .andExpect(jsonPath("$[0].searchCount").value(7));
    }
}
