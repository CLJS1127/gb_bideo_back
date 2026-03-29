// ─── showToast, showEmailInviteModal, createAvatarDataUri, encodeSvg, placeholderPalettes, LOCAL_PROFILE_IMAGE → navigation.js로 이동됨 ───
window.addEventListener('load', () => {
  function inferBideoAuthSnackbarType(message) {
    const text = String(message || '');
    return /(실패|오류|입력하세요|다시 진행|연결되지 않았)/.test(text) ? 'error' : 'success';
  }

  function showBideoAuthSnackbar(message) {
    const text = String(message || '');
    if (!text) return;

    if (typeof BideoSnackbar !== 'undefined') {
      BideoSnackbar.show(text, inferBideoAuthSnackbarType(text));
      return;
    }

    const nativeAlert = window.__bideoNativeAlert;
    if (typeof nativeAlert === 'function') {
      nativeAlert(text);
      return;
    }

    window.alert(text);
  }

  window.inferBideoAuthSnackbarType = inferBideoAuthSnackbarType;
  window.showBideoAuthSnackbar = showBideoAuthSnackbar;

// ─── 로그인 상태 (Thymeleaf에서 window.IS_LOGGED_IN 설정) ───
  const IS_LOGGED_IN = window.IS_LOGGED_IN || false;

// ─── 인증 모달은 auth-modal.js에서 제공 (showAuthModal, closeAuthModal, toggleAuthPassword) ───
// ─── 회원가입 모달은 signup-modal.js에서 제공 (showSignupModal, closeSignupModal, toggleSignupPassword) ───

// ─── 데이터 (API 기반) ─────────────────────────────────
  const BATCH_SIZE = 30;
  const pinStore = new Map();
  let currentPage = 1;
  let hasMorePages = true;
  let currentKeyword = '';

  async function fetchWorks(page, size) {
    let url = '/api/works?page=' + page + '&size=' + size;
    if (currentKeyword) url += '&keyword=' + encodeURIComponent(currentKeyword);
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error: ' + res.status);
    return res.json();
  }

  function mapWorkToPin(work) {
    return {
      id: 'work-' + work.id,
      workId: work.id,
      imageUrl: work.thumbnailUrl || '/images/BIDEO_LOGO/BIDEO_favicon.png',
      width: work.thumbnailWidth || 400,
      height: work.thumbnailHeight || 300,
      title: work.title || '',
      description: work.description || '',
      author: {
        name: work.memberNickname || '크리에이터',
        avatar: work.memberProfileImage || LOCAL_PROFILE_IMAGE
      },
      saves: work.saveCount || 0
    };
  }

  function findSearchBoxSurface() {
    return document.querySelector('#searchBoxContainer .search-bar__surface, #searchBoxContainer .search-bar, #searchBoxContainer .rounded-field-surface');
  }

  function findHeaderActionSlot(element) {
    if (!element) return null;
    return element.closest('.slot-block, .profile-summary, .icon-button');
  }

// ─── 검색 제안 썸네일 (CSS gradient) ─────────────────
  function thumbHTML(title, index) {
    const palette = placeholderPalettes[index % placeholderPalettes.length];
    const safeTitle = (title || 'BIDEO').replace(/[&<>"']/g, '').slice(0, 12);
    return '<div class="search-suggest__thumb" style="background:linear-gradient(135deg,' +
        palette[0] + ',' + palette[1] + ',' + palette[2] + ')">' +
        '<span class="search-suggest__thumb-label">' + safeTitle + '</span></div>';
  }

  function escapeHTML(text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, function (char) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;'
      })[char];
    });
  }

// ─── 예술관 카드 HTML 생성 ─────────────────────────
  function createArtGalleryCardHTML(pin) {
    return (
        '<article class="art-gallery-card" data-id="' + pin.id + '" data-action="open-pin-detail">' +
        '<div class="art-gallery-card__image-wrap" style="aspect-ratio:' + pin.width + '/' + pin.height + '">' +
        '<img class="art-gallery-card__image" src="' + pin.imageUrl + '" alt="' + pin.title + '" width="' + pin.width + '" height="' + pin.height + '" loading="lazy" />' +
        '<div class="art-gallery-card__overlay">' +
        '<div class="art-gallery-card__top-actions">' +
        '<button class="art-gallery-card__save-btn" type="button" data-action="toggle-pin-save">찜</button>' +
        '</div>' +
        '<div class="art-gallery-card__bottom-actions">' +
        '<div class="art-gallery-card__action-group">' +
        '<button class="art-gallery-card__icon-btn" type="button" title="공유" data-action="share-pin-menu">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>' +
        '</button>' +
        '<button class="art-gallery-card__icon-btn" type="button" title="더보기" data-action="more-pin-menu">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="art-gallery-card__info">' +
        '<p class="art-gallery-card__title">' + pin.title + '</p>' +
        '</div>' +
        '</article>'
    );
  }

// ─── 검색 제안 캐시 ─────────────────────────────────
  const searchCache = { recent: { data: null, ts: 0 }, galleries: { data: null, ts: 0 }, trending: { data: null, ts: 0 } };
  const CACHE_TTL_SHORT = 30000;   // 최근검색: 30초
  const CACHE_TTL_LONG  = 300000;  // 트렌딩/추천: 5분
  const SEARCH_SECTION_META = {
    recent: { heading: '최근 검색 기록', loadingCount: 3, smallItems: false },
    galleries: { heading: '추천 예술관', loadingCount: 4, smallItems: false },
    trending: { heading: 'BIDEO 인기 탐색', loadingCount: 4, smallItems: true }
  };

// ─── 검색 제안 데이터 (API + 캐시) ──────────────────
  async function fetchRecentSearches() {
    if (!IS_LOGGED_IN) return [];
    if (searchCache.recent.data && Date.now() - searchCache.recent.ts < CACHE_TTL_SHORT) return searchCache.recent.data;
    try {
      const res = await fetch('/api/search/recent');
      if (!res.ok) return [];
      const data = await res.json();
      searchCache.recent.data = data;
      searchCache.recent.ts = Date.now();
      return data;
    } catch (e) { return []; }
  }

  async function fetchRecommendedGalleries() {
    if (searchCache.galleries.data && Date.now() - searchCache.galleries.ts < CACHE_TTL_LONG) return searchCache.galleries.data;
    try {
      const res = await fetch('/api/search/recommended-galleries');
      if (!res.ok) return [];
      const data = await res.json();
      searchCache.galleries.data = data;
      searchCache.galleries.ts = Date.now();
      return data;
    } catch (e) { return []; }
  }

  async function fetchTrendingKeywords() {
    if (searchCache.trending.data && Date.now() - searchCache.trending.ts < CACHE_TTL_LONG) return searchCache.trending.data;
    try {
      const res = await fetch('/api/search/trending');
      if (!res.ok) return [];
      const data = await res.json();
      searchCache.trending.data = data;
      searchCache.trending.ts = Date.now();
      return data;
    } catch (e) { return []; }
  }

  async function saveSearchHistory(keyword) {
    if (!IS_LOGGED_IN || !keyword) return;
    try {
      await fetch('/api/search/recent', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({keyword: keyword})
      });
      searchCache.recent.ts = 0; // 캐시 무효화
    } catch (e) { /* ignore */ }
  }

  async function deleteSearchHistory(id) {
    if (!id) return;
    try {
      await fetch('/api/search/recent/' + id, {method: 'DELETE'});
      searchCache.recent.ts = 0; // 캐시 무효화
    } catch (e) { /* ignore */ }
  }

// ─── 검색바 인터랙션 ───────────────────────────────
  let searchSuggestionsCreated = false;
  let lastRenderedHTML = '';
  const searchSectionMarkup = { recent: '', galleries: '', trending: '' };
  const searchSectionRequests = { recent: null, galleries: null, trending: null };

  function buildSectionHTML(sectionKey, bodyHTML) {
    return '<div class="search-suggest__section" data-search-section="' + sectionKey + '">' +
        '<div class="search-suggest__heading">' + SEARCH_SECTION_META[sectionKey].heading + '</div>' +
        bodyHTML +
        '</div>';
  }

  function buildLoadingSectionHTML(sectionKey) {
    const config = SEARCH_SECTION_META[sectionKey];
    let items = '';
    for (let i = 0; i < config.loadingCount; i++) {
      items += '<div class="search-suggest__item search-suggest__item--placeholder' +
          (config.smallItems ? ' search-suggest__item--small' : '') + '">' +
          '<div class="search-suggest__thumb search-suggest__thumb--placeholder"></div>' +
          '<span class="search-suggest__text search-suggest__text--placeholder">loading</span>' +
          '</div>';
    }
    return buildSectionHTML(sectionKey, '<div class="search-suggest__grid">' + items + '</div>');
  }

  function buildStatusSectionHTML(sectionKey, message) {
    return buildSectionHTML(sectionKey,
        '<div class="search-suggest__status">' + escapeHTML(message) + '</div>');
  }

  function buildRecentSectionHTML(recentData) {
    if (!IS_LOGGED_IN) return '';
    if (!recentData.length) return buildStatusSectionHTML('recent', '최근 검색 기록이 없습니다.');

    let items = '';
    recentData.forEach(function (item) {
      items += '<div class="search-suggest__item" data-search-id="' + item.id + '">' +
          thumbHTML(item.keyword, item.id || 0) +
          '<span class="search-suggest__text">' + escapeHTML(item.keyword) + '</span>' +
          '<button class="search-suggest__delete" type="button" data-action="remove-recent-search" aria-label="삭제">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg>' +
          '</button>' +
          '</div>';
    });
    return buildSectionHTML('recent', '<div class="search-suggest__grid">' + items + '</div>');
  }

  function buildGallerySectionHTML(galleryData) {
    if (!galleryData.length) return '';

    let items = '';
    galleryData.forEach(function (item) {
      const thumb = item.coverImageUrl
          ? '<img class="search-suggest__thumb" src="' + item.coverImageUrl + '" alt="" loading="lazy" decoding="async" />'
          : thumbHTML(item.title, item.id || 0);
      items += '<div class="search-suggest__item" data-gallery-id="' + item.id + '">' +
          thumb +
          '<span class="search-suggest__text">' + escapeHTML(item.title) + '</span>' +
          '</div>';
    });
    return buildSectionHTML('galleries', '<div class="search-suggest__grid">' + items + '</div>');
  }

  function buildTrendingSectionHTML(trendingData) {
    if (!trendingData.length) return '';

    let items = '';
    trendingData.forEach(function (item, idx) {
      items += '<div class="search-suggest__item search-suggest__item--small">' +
          thumbHTML(item.keyword, 700 + idx) +
          '<span class="search-suggest__text">' + escapeHTML(item.keyword) + '</span>' +
          '</div>';
    });
    return buildSectionHTML('trending', '<div class="search-suggest__grid">' + items + '</div>');
  }

  function renderSearchSuggestions() {
    if (!cachedDropdown) return;

    let html = searchSectionMarkup.recent + searchSectionMarkup.galleries + searchSectionMarkup.trending;
    if (!html) {
      html = buildStatusSectionHTML('trending', '추천 검색어를 불러오지 못했습니다.');
    }

    if (html === lastRenderedHTML) return;
    lastRenderedHTML = html;
    cachedDropdown.innerHTML = html;
  }

  function updateSearchSectionMarkup(sectionKey, html) {
    searchSectionMarkup[sectionKey] = html;
    renderSearchSuggestions();
  }

  function resetSearchSectionMarkup() {
    searchSectionMarkup.recent = IS_LOGGED_IN ? buildLoadingSectionHTML('recent') : '';
    searchSectionMarkup.galleries = buildLoadingSectionHTML('galleries');
    searchSectionMarkup.trending = buildLoadingSectionHTML('trending');
  }

  function isSectionCacheExpired(sectionKey) {
    const cache = searchCache[sectionKey];
    const ttl = sectionKey === 'recent' ? CACHE_TTL_SHORT : CACHE_TTL_LONG;
    return !cache.data || Date.now() - cache.ts >= ttl;
  }

  function hasExpiredSearchSection() {
    return (IS_LOGGED_IN && isSectionCacheExpired('recent')) ||
        isSectionCacheExpired('galleries') ||
        isSectionCacheExpired('trending');
  }

  function fetchSearchSectionData(sectionKey) {
    if (sectionKey === 'recent') return fetchRecentSearches();
    if (sectionKey === 'galleries') return fetchRecommendedGalleries();
    return fetchTrendingKeywords();
  }

  function renderSearchSection(sectionKey, data) {
    if (sectionKey === 'recent') return buildRecentSectionHTML(data);
    if (sectionKey === 'galleries') return buildGallerySectionHTML(data);
    return buildTrendingSectionHTML(data);
  }

  async function loadSearchSection(sectionKey, forceRefresh) {
    if (sectionKey === 'recent' && !IS_LOGGED_IN) {
      updateSearchSectionMarkup('recent', '');
      return [];
    }

    if (!forceRefresh && !isSectionCacheExpired(sectionKey)) {
      updateSearchSectionMarkup(sectionKey, renderSearchSection(sectionKey, searchCache[sectionKey].data || []));
      return searchCache[sectionKey].data || [];
    }

    if (searchSectionRequests[sectionKey]) return searchSectionRequests[sectionKey];

    if (!searchCache[sectionKey].data) {
      updateSearchSectionMarkup(sectionKey, buildLoadingSectionHTML(sectionKey));
    }

    searchSectionRequests[sectionKey] = fetchSearchSectionData(sectionKey)
        .then(function (data) {
          updateSearchSectionMarkup(sectionKey, renderSearchSection(sectionKey, data));
          searchSectionRequests[sectionKey] = null;
          return data;
        })
        .catch(function () {
          updateSearchSectionMarkup(sectionKey, sectionKey === 'recent'
              ? buildStatusSectionHTML('recent', '최근 검색 기록을 불러오지 못했습니다.')
              : '');
          searchSectionRequests[sectionKey] = null;
          return [];
        });

    return searchSectionRequests[sectionKey];
  }

  let cachedOverlay = null;
  let cachedDropdown = null;
  let cachedSearchBox = null;
  let cachedSidebar = null;

  function ensureDropdownElements() {
    if (cachedOverlay) return;
    const searchContainer = document.getElementById('searchBoxContainer');
    if (!searchContainer) return;

    cachedOverlay = document.createElement('div');
    cachedOverlay.id = 'searchOverlay';
    cachedOverlay.className = 'search-overlay';
    document.body.appendChild(cachedOverlay);

    cachedDropdown = document.createElement('div');
    cachedDropdown.id = 'searchSuggestions';
    cachedDropdown.className = 'search-suggest';
    const header = document.getElementById('HeaderContent');
    (header || searchContainer).appendChild(cachedDropdown);
    resetSearchSectionMarkup();
    renderSearchSuggestions();

    cachedSearchBox = findSearchBoxSurface();
    cachedSidebar = document.getElementById('VerticalNavContent');
  }

  async function populateSearchSuggestions() {
    if (searchSuggestionsCreated) return;
    searchSuggestionsCreated = true;
    await Promise.all([
      loadSearchSection('recent', true),
      loadSearchSection('galleries', true),
      loadSearchSection('trending', true)
    ]);
  }

  function showSearchSuggestions() {
    if (cachedDropdown) cachedDropdown.classList.add('search-suggest--visible');
    if (cachedOverlay) cachedOverlay.classList.add('search-overlay--visible');
    if (cachedSearchBox) {
      cachedSearchBox.style.borderRadius = '12px';
      cachedSearchBox.style.boxShadow = 'none';
    }
    if (cachedSidebar) cachedSidebar.style.zIndex = '669';
  }

  function hideSearchSuggestions() {
    if (cachedDropdown) cachedDropdown.classList.remove('search-suggest--visible');
    if (cachedOverlay) cachedOverlay.classList.remove('search-overlay--visible');
    if (cachedSearchBox) {
      cachedSearchBox.style.borderRadius = '';
      cachedSearchBox.style.boxShadow = '';
    }
    if (cachedSidebar) cachedSidebar.style.zIndex = '';
  }

  function removeRecentSearch(btn) {
    const item = btn.closest('.search-suggest__item');
    if (item) {
      const searchId = item.getAttribute('data-search-id');
      if (searchId) {
        searchCache.recent.data = (searchCache.recent.data || []).filter(function (entry) {
          return String(entry.id) !== String(searchId);
        });
        searchCache.recent.ts = Date.now();
        updateSearchSectionMarkup('recent', buildRecentSectionHTML(searchCache.recent.data));
        deleteSearchHistory(searchId);
      }
    }
    // 포커스 복귀하여 blur→hide 방지
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.focus();
  }

  async function executeSearch(keyword) {
    currentKeyword = keyword || '';
    currentPage = 1;
    hasMorePages = true;
    pinStore.clear();
    const masonryEl = document.getElementById('masonry');
    if (masonryEl) masonryEl.innerHTML = '';
    hideSearchSuggestions();
    if (currentKeyword) saveSearchHistory(currentKeyword);
    await loadMorePins();
  }

  function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchContainer = document.getElementById('searchBoxContainer');
    if (!searchInput || !searchContainer) return;

    // 빈 컨테이너만 미리 생성 (API 호출 없음)
    ensureDropdownElements();

    let refreshTimer = null;
    searchInput.addEventListener('focus', function () {
      showSearchSuggestions(); // 즉시 표시 (빈 상태라도)
      // 첫 포커스 시 데이터 로드, 이후엔 캐시 만료 시에만 갱신
      if (!searchSuggestionsCreated) {
        populateSearchSuggestions();
      } else if (hasExpiredSearchSection()) {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(refreshSearchSuggestions, 300);
      }
    });

    searchInput.addEventListener('blur', function () {
      setTimeout(function () {
        if (document.activeElement !== searchInput) {
          hideSearchSuggestions();
        }
      }, 200);
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchInput.blur();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch(searchInput.value.trim());
        searchInput.blur();
      }
    });

    // 검색 제안 항목 클릭 시 검색 실행 / 삭제 버튼 처리
    cachedDropdown.addEventListener('click', function (e) {
      const deleteBtn = e.target.closest('[data-action="remove-recent-search"]');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        removeRecentSearch(deleteBtn);
        return;
      }
      const item = e.target.closest('.search-suggest__item');
      if (!item) return;
      const galleryId = item.getAttribute('data-gallery-id');
      if (galleryId) {
        hideSearchSuggestions();
        searchInput.blur();
        if (typeof window.openGalleryDetail === 'function') {
          window.openGalleryDetail(galleryId);
        }
        return;
      }
      const text = item.querySelector('.search-suggest__text');
      if (text) {
        searchInput.value = text.textContent;
        executeSearch(text.textContent.trim());
        searchInput.blur();
      }
    });

    // 오버레이 클릭 시 닫기
    document.addEventListener('click', function (e) {
      const overlay = document.getElementById('searchOverlay');
      if (e.target === overlay) {
        searchInput.blur();
      }
    });
  }

  async function refreshSearchSuggestions() {
    if (!cachedDropdown) return;

    await Promise.all([
      IS_LOGGED_IN && isSectionCacheExpired('recent') ? loadSearchSection('recent', true) : Promise.resolve(),
      isSectionCacheExpired('galleries') ? loadSearchSection('galleries', true) : Promise.resolve(),
      isSectionCacheExpired('trending') ? loadSearchSection('trending', true) : Promise.resolve()
    ]);
  }

  /* 사이드 네비 관련 함수는 navigation.js 참조 */


// ─── 작품 렌더링 & 무한 스크롤 ───────────────────────
  let isLoading = false;

  function getActiveFeedElements() {
    if (window.isCloseupOpen) {
      return {
        container: document.getElementById('closeupRelatedPins'),
        loader: document.getElementById('closeupLoader')
      };
    }

    return {
      container: document.getElementById('masonry'),
      loader: document.getElementById('loader')
    };
  }

  function renderPins(pins) {
    const masonryEl = getActiveFeedElements().container;
    const fragment = document.createDocumentFragment();
    const temp = document.createElement('div');
    pins.forEach(function (pin) {
      temp.innerHTML = createArtGalleryCardHTML(pin);
      fragment.appendChild(temp.firstElementChild);
    });
    masonryEl.appendChild(fragment);
  }

  async function loadMorePins() {
    if (isLoading || !hasMorePages) return;
    isLoading = true;
    const activeFeed = getActiveFeedElements();
    const loaderEl = activeFeed.loader;
    if (loaderEl) loaderEl.classList.remove('loader--hidden');
    try {
      if (window.isCloseupOpen) {
        if (typeof window.appendCloseupPins === 'function') {
          await window.appendCloseupPins(BATCH_SIZE);
        } else {
          console.warn('appendCloseupPins hook is not available yet');
          return;
        }
      } else {
        const data = await fetchWorks(currentPage, BATCH_SIZE);
        const pins = (data.content || []).map(mapWorkToPin);
        pins.forEach(function (p) { pinStore.set(p.id, p); });
        renderPins(pins);
        currentPage++;
        hasMorePages = currentPage <= (data.totalPages || 1);
      }
    } catch (e) {
      console.error('작품 로드 실패:', e);
    }
    isLoading = false;
    if (loaderEl) loaderEl.classList.add('loader--hidden');
  }

// ─── 전역 클릭으로 메뉴 닫기 ───────────────────────
  document.addEventListener('click', function (event) {
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      if (actionButton.dataset.action === 'remove-recent-search') {
        event.preventDefault();
        event.stopPropagation();
        removeRecentSearch(actionButton);
      }
      return;
    }

    if (event.target.closest('.context-menu, .closeup-floating-layer')) {
      return;
    }

    if (typeof window.closeAllMenus === 'function') {
      window.closeAllMenus();
    }
  });

// ESC로 closeup/검색 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (window.isCloseupOpen) {
        window.closeCloseupView();
      }
      const searchInput = document.getElementById('search-input');
      if (document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.blur();
      }
      hideSearchSuggestions();
      if (typeof window.closeAllMenus === 'function') {
        window.closeAllMenus();
      }
    }
  });


// ─── 게스트 모드 초기화 ───────────────────────────────
  function initGuestMode() {
    document.body.classList.add('guest-mode');

    // 프로필 + 계정 드롭다운 숨기고 로그인 버튼 삽입
    const profileBtn = document.querySelector('[aria-label="내 프로필"]');
    const accountBtn = document.querySelector('[aria-label="계정"]');
    const profileSlot = findHeaderActionSlot(profileBtn);
    const accountSlot = findHeaderActionSlot(accountBtn);
    if (profileSlot) profileSlot.style.display = 'none';
    if (accountSlot) accountSlot.style.display = 'none';

    // 로그인 버튼 삽입
    const btnContainer = document.querySelector('[data-test-id="button-container"]');
    if (btnContainer) {
      const authBtns = document.createElement('div');
      authBtns.className = 'guest-header-actions';
      authBtns.innerHTML =
          '<a class="guest-header__login" href="#" onclick="showAuthModal()">로그인</a>' +
          '<a class="guest-header__signup" href="#" onclick="showSignupModal()">회원가입</a>';
      btnContainer.appendChild(authBtns);
    }

    // 하단 배너 (메인 페이지에서만)
    if (window.location.pathname === '/') {
      const banner = document.createElement('div');
      banner.className = 'guest-bottom-banner';
      banner.innerHTML =
          '<div class="guest-bottom-banner__content">' +
          '<div class="guest-bottom-banner__text">' +
          '<img src="/images/BIDEO_LOGO/favi_bideo_white.png" alt="" width="32" height="32">' +
          '<span>BIDEO에서 더 많은 아이디어를 발견하세요</span>' +
          '</div>' +
          '<a class="guest-bottom-banner__signup" href="#" onclick="showSignupModal()">무료로 가입하기</a>' +
          '</div>';
      document.body.appendChild(banner);
    }

    // 댓글 입력창 비 로그인 안내
    const commentInput = document.querySelector('.closeup__comment-input');
    if (commentInput) {
      commentInput.setAttribute('data-placeholder', '로그인하고 댓글을 남겨보세요');
      commentInput.addEventListener('focus', function () {
        if (!IS_LOGGED_IN) {
          this.blur();
          showAuthModal();
        }
      });
    }
  }

  // ─── 전역 공유 (closeup.js에서 사용) ─────────────────
  window.pinStore = pinStore;
  window.BATCH_SIZE = BATCH_SIZE;
  window.mapWorkToPin = mapWorkToPin;
  window.createArtGalleryCardHTML = createArtGalleryCardHTML;
  window.fetchWorks = fetchWorks;

  // ─── 초기화 ─────────────────────────────────────────
  if (!IS_LOGGED_IN) initGuestMode();

  initSearch();

  // 첫 배치 로드
  const loaderEl = document.getElementById('loader');
  const closeupLoaderEl = document.getElementById('closeupLoader');

  if (loaderEl) {
    loadMorePins();

    // 무한 스크롤: IntersectionObserver + scroll 이벤트 백업
    const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              loadMorePins();
            }
          });
        },
        {rootMargin: '600px'}
    );
    observer.observe(loaderEl);
    if (closeupLoaderEl) observer.observe(closeupLoaderEl);

    // scroll 이벤트 백업 (IntersectionObserver가 안 될 경우 대비)
    window.addEventListener('scroll', function () {
      if (isLoading) return;
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollBottom >= docHeight - 800) {
        loadMorePins();
      }
    });
  }
});

