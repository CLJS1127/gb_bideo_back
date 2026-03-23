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

  async function fetchWorks(page, size) {
    const res = await fetch('/api/works?page=' + page + '&size=' + size);
    if (!res.ok) throw new Error('API error: ' + res.status);
    return res.json();
  }

  function mapWorkToPin(work) {
    return {
      id: 'work-' + work.id,
      workId: work.id,
      imageUrl: work.thumbnailUrl || '/images/BIDEO_LOGO/favi_bideo.png',
      width: work.thumbnailWidth || 400,
      height: work.thumbnailHeight || 300,
      title: work.title || '',
      description: work.description || '',
      author: {
        name: work.memberNickname || '크리에이터',
        avatar: work.memberProfileImage || ''
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

// ─── 검색 제안용 SVG 생성 ────────────────────────────
  function createArtworkDataUri(title, index, width, height) {
    const palette = placeholderPalettes[index % placeholderPalettes.length];
    const safeTitle = (title || 'BIDEO').replace(/[&<>"']/g, '');
    return encodeSvg(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '">' +
        '<defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="' + palette[0] + '"/>' +
        '<stop offset="60%" stop-color="' + palette[1] + '"/>' +
        '<stop offset="100%" stop-color="' + palette[2] + '"/>' +
        '</linearGradient></defs>' +
        '<rect width="' + width + '" height="' + height + '" fill="url(#bg)"/>' +
        '<circle cx="' + Math.round(width * 0.78) + '" cy="' + Math.round(height * 0.22) + '" r="' + Math.round(Math.min(width, height) * 0.12) + '" fill="rgba(255,255,255,0.18)"/>' +
        '<text x="10%" y="78%" fill="#ffffff" font-family="Arial, sans-serif" font-size="' + Math.max(22, Math.round(width * 0.07)) + '" font-weight="700">' + safeTitle.slice(0, 18) + '</text>' +
        '</svg>'
    );
  }

  function createThumbEntries(texts, startIndex) {
    return texts.map(function (text, index) {
      return {text: text, img: createArtworkDataUri(text, startIndex + index, 236, 236)};
    });
  }

// ─── 예술관 카드 HTML 생성 ─────────────────────────
  function createArtGalleryCardHTML(pin) {
    return (
        '<article class="art-gallery-card" data-id="' + pin.id + '" onclick="openPinDetail(this)">' +
        '<div class="art-gallery-card__image-wrap" style="aspect-ratio:' + pin.width + '/' + pin.height + '">' +
        '<img class="art-gallery-card__image" src="' + pin.imageUrl + '" alt="' + pin.title + '" width="' + pin.width + '" height="' + pin.height + '" loading="lazy" />' +
        '<div class="art-gallery-card__overlay">' +
        '<div class="art-gallery-card__top-actions">' +
        '<button class="art-gallery-card__save-btn" onclick="toggleSave(event, this)">찜</button>' +
        '</div>' +
        '<div class="art-gallery-card__bottom-actions">' +
        '<div class="art-gallery-card__action-group">' +
        '<button class="art-gallery-card__icon-btn" title="공유" onclick="sharePinMenu(event, this)">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>' +
        '</button>' +
        '<button class="art-gallery-card__icon-btn" title="더보기" onclick="morePinMenu(event, this)">' +
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

// ─── 검색 제안 데이터 (더미) ─────────────────────────
  const recentSearches = createThumbEntries([
    '집 분위기 바꾸기: 양치식물', 'steak garnish', '감성 인테리어', '네일 아트 디자인', '홈카페 레시피',
    '여행 사진 구도', '미니멀 패션', '수채화 그리기', '건강한 아침식사', '캘리그라피 연습'
  ], 500);
  const recommendedIdeas = createThumbEntries([
    '대시보드 ui', '모던 건축', '브런치 카페', '빈티지 포스터',
    '일러스트 캐릭터', '플랜트 인테리어', '북유럽 스타일', '감성 사진'
  ], 600);
  const trendingSearches = createThumbEntries([
    '청순', '가을 코디', '헤어스타일', '셀프 인테리어',
    '다이어트 식단', '웨딩 데코', '타투 디자인', '캠핑 장비'
  ], 700);

// ─── 검색바 인터랙션 ───────────────────────────────
  let searchSuggestionsCreated = false;

  function createSearchSuggestions() {
    const searchContainer = document.getElementById('searchBoxContainer');
    if (!searchContainer || searchSuggestionsCreated) return;

    // 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = 'searchOverlay';
    overlay.className = 'search-overlay';
    document.body.appendChild(overlay);

    // 드롭다운 생성
    const dropdown = document.createElement('div');
    dropdown.id = 'searchSuggestions';
    dropdown.className = 'search-suggest';

    // 최근 검색 기록 섹션
    let html = '<div class="search-suggest__section">' +
        '<div class="search-suggest__heading">최근 검색 기록</div>' +
        '<div class="search-suggest__grid">';
    recentSearches.forEach(function (item, idx) {
      html += '<div class="search-suggest__item" data-recent-idx="' + idx + '">' +
          '<img class="search-suggest__thumb" src="' + item.img + '" alt="" />' +
          '<span class="search-suggest__text">' + item.text + '</span>' +
          '<button class="search-suggest__delete" aria-label="삭제" onclick="event.stopPropagation(); removeRecentSearch(this)">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg>' +
          '</button>' +
          '</div>';
    });
    html += '</div></div>';

    // 추천 예술관 섹션
    html += '<div class="search-suggest__section">' +
        '<div class="search-suggest__heading">추천 예술관</div>' +
        '<div class="search-suggest__grid">';
    recommendedIdeas.forEach(function (item) {
      html += '<div class="search-suggest__item">' +
          '<img class="search-suggest__thumb" src="' + item.img + '" alt="" />' +
          '<span class="search-suggest__text">' + item.text + '</span>' +
          '</div>';
    });
    html += '</div></div>';

    // 인기 검색어 섹션
    html += '<div class="search-suggest__section">' +
        '<div class="search-suggest__heading">BIDEO 인기 탐색</div>' +
        '<div class="search-suggest__grid">';
    trendingSearches.forEach(function (item) {
      html += '<div class="search-suggest__item search-suggest__item--small">' +
          '<img class="search-suggest__thumb" src="' + item.img + '" alt="" />' +
          '<span class="search-suggest__text">' + item.text + '</span>' +
          '</div>';
    });
    html += '</div></div>';

    dropdown.innerHTML = html;
    const header = document.getElementById('HeaderContent');
    (header || searchContainer).appendChild(dropdown);
    searchSuggestionsCreated = true;
  }

  function showSearchSuggestions() {
    const dropdown = document.getElementById('searchSuggestions');
    const overlay = document.getElementById('searchOverlay');
    const searchBox = findSearchBoxSurface();
    const sidebar = document.getElementById('VerticalNavContent');
    if (dropdown) dropdown.style.display = 'block';
    if (overlay) overlay.style.display = 'block';
    if (searchBox) {
      searchBox.style.borderRadius = '12px';
      searchBox.style.boxShadow = 'none';
    }
    if (sidebar) sidebar.style.zIndex = '669';
  }

  function hideSearchSuggestions() {
    const dropdown = document.getElementById('searchSuggestions');
    const overlay = document.getElementById('searchOverlay');
    const searchBox = findSearchBoxSurface();
    const sidebar = document.getElementById('VerticalNavContent');
    if (dropdown) dropdown.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    if (searchBox) {
      searchBox.style.borderRadius = '';
      searchBox.style.boxShadow = '';
    }
    if (sidebar) sidebar.style.zIndex = '';
  }

  function removeRecentSearch(btn) {
    const item = btn.closest('.search-suggest__item');
    if (item) {
      item.style.transition = 'opacity 0.2s, transform 0.2s';
      item.style.opacity = '0';
      item.style.transform = 'scale(0.8)';
      setTimeout(function () {
        item.remove();
      }, 200);
    }
    // 포커스 복귀하여 blur→hide 방지
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.focus();
  }

  function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchContainer = document.getElementById('searchBoxContainer');
    if (!searchInput || !searchContainer) return;

    // 드롭다운 생성
    createSearchSuggestions();

    searchInput.addEventListener('focus', function () {
      showSearchSuggestions();
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
    });

    // 오버레이 클릭 시 닫기
    const overlay = document.getElementById('searchOverlay');
    if (overlay) {
      overlay.addEventListener('click', function () {
        searchInput.blur();
      });
    }
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
    loaderEl.classList.remove('loader--hidden');
    try {
      if (window.isCloseupOpen) {
        await appendCloseupPins(BATCH_SIZE);
      } else {
        const data = await fetchWorks(currentPage, BATCH_SIZE);
        var pins = (data.content || []).map(mapWorkToPin);
        pins.forEach(function (p) { pinStore.set(p.id, p); });
        renderPins(pins);
        currentPage++;
        hasMorePages = currentPage <= (data.totalPages || 1);
      }
    } catch (e) {
      console.error('작품 로드 실패:', e);
    }
    isLoading = false;
    loaderEl.classList.add('loader--hidden');
  }

// ─── 전역 클릭으로 메뉴 닫기 ───────────────────────
  document.addEventListener('click', function () {
    closeAllMenus();
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
      closeAllMenus();
    }
  });


// ─── 게스트 모드 초기화 ───────────────────────────────
  function initGuestMode() {
    document.body.classList.add('guest-mode');

    // 사이드바 숨기기
    const sidebar = document.getElementById('VerticalNavContent');
    if (sidebar) sidebar.style.display = 'none';

    // 헤더 left 조정
    const header = document.getElementById('HeaderContent');
    if (header) header.style.left = '0';

    // appViewport 패딩 조정 (사이드바 없음)
    const viewport = document.querySelector('.appViewport');
    if (viewport) {
      viewport.style.paddingLeft = '24px';
      viewport.style.paddingRight = '24px';
    }

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

    // 하단 배너
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
  loadMorePins();

  // 무한 스크롤: IntersectionObserver + scroll 이벤트 백업
  const loaderEl = document.getElementById('loader');
  const closeupLoaderEl = document.getElementById('closeupLoader');
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
  observer.observe(closeupLoaderEl);

  // scroll 이벤트 백업 (IntersectionObserver가 안 될 경우 대비)
  window.addEventListener('scroll', function () {
    if (isLoading) return;
    const scrollBottom = window.innerHeight + window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    if (scrollBottom >= docHeight - 800) {
      loadMorePins();
    }
  });
});

