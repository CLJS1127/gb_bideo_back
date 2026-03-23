// ─── Closeup View (depends on main.js globals) ──────────────
// Globals used from main.js: IS_LOGGED_IN, pinStore, createAvatarDataUri(),
//   createArtworkDataUri(), showToast(), LOCAL_PROFILE_IMAGE, generatePins(),
//   createArtGalleryCardHTML(), BATCH_SIZE
// Globals used from auth-modal.js: showAuthModal()
window.addEventListener('load', () => {
  // ─── Badge Constants ────────────────────────────────────────
  const BADGE_IMAGES = [
    'art_gallery_views_over_10_million.png',
    'auction_price_of_10_million_won_badge.png',
    'auction_price_of_1_million_won_badge.png',
    'contest_award_badge.png',
    'first_auction_winner_badge.png',
    'first_sell_badge.png',
    'first_video_badge.png',
    'uploaded_more_than_5_times_badge.png',
    'write_contest_badge.png'
  ];
  const BADGE_BASE_PATH = '/images/badge/';
  const BADGE_LABELS = {
    'art_gallery_views_over_10_million.png': '갤러리 조회수 1,000만 달성',
    'auction_price_of_10_million_won_badge.png': '경매가 1,000만원 달성',
    'auction_price_of_1_million_won_badge.png': '경매가 100만원 달성',
    'contest_award_badge.png': '콘테스트 수상',
    'first_auction_winner_badge.png': '첫 경매 낙찰',
    'first_sell_badge.png': '첫 판매 달성',
    'first_video_badge.png': '첫 영상 업로드',
    'uploaded_more_than_5_times_badge.png': '5회 이상 업로드',
    'write_contest_badge.png': '콘테스트 참가'
  };

// ─── Constants ───────────────────────────────────────────────
  const CLOSEUP_LIKE_OUTLINE_PATH = 'M14.1 5.6A4.47 4.47 0 0 1 22 8.48V9c0 2.18-1.65 4.56-4.1 6.78a35 35 0 0 1-5.9 4.21 35 35 0 0 1-5.9-4.21C3.64 13.56 2 11.18 2 9v-.53a4.47 4.47 0 0 1 7.9-2.86L12 8.12zm-3.47-2.08A6.47 6.47 0 0 0 0 8.47V9c0 6.18 8.97 11.59 11.07 12.76q.43.24.93.24t.93-.24C15.03 20.6 24 15.18 24 9v-.53a6.47 6.47 0 0 0-11.44-4.14L12 5l-.56-.67q-.38-.45-.8-.81';
  const CLOSEUP_LIKE_FILLED_PATH = 'M0 9c0 6.18 8.97 11.59 11.07 12.76q.43.24.93.24t.93-.24C15.03 20.6 24 15.18 24 9v-.53a6.47 6.47 0 0 0-11.44-4.14L12 5l-.56-.67A6.47 6.47 0 0 0 0 8.47z';
  const CLOSEUP_SHARE_SHEET_ID = 'closeupShareLayer';
  const CLOSEUP_MORE_MENU_ID = 'closeupMoreLayer';

// ─── State variables ────────────────────────────────────────
  let savedScrollY = 0;
  window.window.isCloseupOpen = false;
  let commentComposerInitialized = false;
  let activeCloseupPinId = null;
  let closeupSeed = 0;
  let closeupOffset = 0;
  let closeupScrollHandler = null;

// ─── 찜 버튼 토글 (카드/클로즈업 통합) ──────────────
  function toggleSave(event, btn) {
    if (event) event.stopPropagation();
    if (!IS_LOGGED_IN) { showAuthModal(); return; }
    const isCloseup = btn.classList.contains('closeup__save-btn');
    const savedClass = isCloseup ? 'closeup__save-btn--saved' : 'art-gallery-card__save-btn--saved';
    const isSaved = btn.classList.toggle(savedClass);
    btn.textContent = isSaved ? '찜 완료' : '찜';
  }

  function toggleCloseupLike(btn) {
    if (!IS_LOGGED_IN) { showAuthModal(); return; }
    const isActive = btn.classList.toggle('closeup__icon-btn--liked');
    const path = btn.querySelector('path');
    if (!path) return;
    path.setAttribute('d', isActive ? CLOSEUP_LIKE_FILLED_PATH : CLOSEUP_LIKE_OUTLINE_PATH);
  }

  function focusCloseupDetails() {
    const detailSection = document.querySelector('.closeup__title-section');
    if (!detailSection) return;
    detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleCloseupShareMenu(event, btn) {
    event.stopPropagation();
    if (document.getElementById(CLOSEUP_SHARE_SHEET_ID)) {
      closeCloseupFloatingLayers();
      return;
    }

    closeAllMenus();
    btn.classList.add('closeup__icon-btn--active');
    const rect = btn.getBoundingClientRect();
    const layer = document.createElement('div');
    layer.id = CLOSEUP_SHARE_SHEET_ID;
    layer.className = 'popover-anchor-full closeup-floating-layer';
    layer.innerHTML =
        '<div class="closeup-floating-layer__backdrop"></div>' +
        '<div class="u-box-border">' +
        '<div>' +
        '<span data-type="inside" tabindex="0" aria-hidden="true" data-floating-ui-focus-guard="" data-floating-ui-inert=""></span>' +
        '<div class="u-floating-block u-rounded-400-popover" tabindex="-1" style="position:absolute;left:0;top:0;visibility:visible;outline:none;transform:translate(' + Math.max(16, rect.left - 210) + 'px, ' + Math.max(96, rect.bottom + 12) + 'px);">' +
        '<div aria-label="메뉴 공유" aria-modal="true" class="u-position-relative u-max-viewport-90 u-bg-elevation u-rounded-400-popover closeup-share-sheet" role="dialog">' +
        '<div class="closeup-share-sheet__header"><h2 class="closeup-share-sheet__title">공유</h2></div>' +
        '<div class="closeup-share-sheet__body">' +
        '<div class="closeup-share-sheet__socials">' +
        '<div class="closeup-share-sheet__social"><button class="closeup-share-sheet__social-btn" type="button" onclick="event.stopPropagation(); copyCloseupLink(this)">링크</button><span>링크 복사</span></div>' +
        '<div class="closeup-share-sheet__social"><button class="closeup-share-sheet__social-btn closeup-share-sheet__social-btn--dark" type="button" onclick="event.stopPropagation()">W</button><span>WhatsApp</span></div>' +
        '<div class="closeup-share-sheet__social"><button class="closeup-share-sheet__social-btn" type="button" onclick="event.stopPropagation()">M</button><span>메신저</span></div>' +
        '<div class="closeup-share-sheet__social"><button class="closeup-share-sheet__social-btn" type="button" onclick="event.stopPropagation()">f</button><span>Facebook</span></div>' +
        '<div class="closeup-share-sheet__social"><button class="closeup-share-sheet__social-btn closeup-share-sheet__social-btn--dark" type="button" onclick="event.stopPropagation()">X</button><span>X</span></div>' +
        '</div>' +
        '<input class="closeup-share-sheet__search" id="contactSearch" type="search" placeholder="이름 또는 이메일 검색" aria-label="검색 필드">' +
        '<div class="closeup-share-sheet__contacts">' +
        '<div class="closeup-share-sheet__contact"><img src="' + createAvatarDataUri('정찬호', 20) + '" alt="정찬호"><div class="closeup-share-sheet__contact-copy"><span class="closeup-share-sheet__contact-name">정찬호</span><span class="closeup-share-sheet__contact-handle">@chanho8629</span></div><button class="closeup-share-sheet__send" type="button" onclick="toggleSend(this)">보내기</button></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<span data-type="inside" tabindex="0" aria-hidden="true" data-floating-ui-focus-guard="" data-floating-ui-inert=""></span>' +
        '</div>' +
        '</div>';

    layer.addEventListener('click', function(e) {
      if (e.target === layer || e.target.classList.contains('closeup-floating-layer__backdrop')) {
        closeCloseupFloatingLayers();
      }
    });
    layer.querySelector('.closeup-share-sheet').addEventListener('click', function(e) {
      e.stopPropagation();
    });
    document.body.appendChild(layer);
  }

  function toggleCloseupMoreMenu(event, btn) {
    event.stopPropagation();
    if (document.getElementById(CLOSEUP_MORE_MENU_ID)) {
      closeCloseupFloatingLayers();
      return;
    }

    closeAllMenus();
    btn.classList.add('closeup__icon-btn--active');
    const rect = btn.getBoundingClientRect();
    const layer = document.createElement('div');
    layer.id = CLOSEUP_MORE_MENU_ID;
    layer.className = 'popover-anchor-full closeup-floating-layer closeup-floating-layer--menu';
    layer.innerHTML =
        '<div class="closeup-floating-layer__backdrop"></div>' +
        '<div>' +
        '<span data-type="inside" tabindex="0" aria-hidden="true" data-floating-ui-focus-guard="" data-floating-ui-inert=""></span>' +
        '<div class="u-floating-block u-rounded-300-popover" tabindex="-1" style="position:absolute;left:0;top:0;visibility:visible;outline:none;transform:translate(' + Math.max(16, rect.left - 140) + 'px, ' + Math.max(96, rect.bottom + 12) + 'px);">' +
        '<div aria-label="Dropdown" class="u-position-relative u-max-viewport-90 u-min-touch-target u-bg-elevation u-rounded-300-popover closeup-more-menu" data-test-id="pin-action-dropdown" role="menu">' +
        '<button class="closeup-more-menu__item" type="button">작품 정보 보기</button>' +
        '<button class="closeup-more-menu__item" type="button">비슷한 예술관 더 보기</button>' +
        '<button class="closeup-more-menu__item" type="button">비슷한 예술관 덜 보기</button>' +
        '<button class="closeup-more-menu__item" type="button">작품 신고</button>' +
        '</div>' +
        '</div>' +
        '<span data-type="inside" tabindex="0" aria-hidden="true" data-floating-ui-focus-guard="" data-floating-ui-inert=""></span>' +
        '</div>';

    layer.addEventListener('click', function(e) {
      if (e.target === layer || e.target.classList.contains('closeup-floating-layer__backdrop')) {
        closeCloseupFloatingLayers();
      }
    });
    layer.querySelector('.closeup-more-menu').addEventListener('click', function(e) {
      e.stopPropagation();
    });
    document.body.appendChild(layer);
  }

  function copyCloseupLink(btn) {
    const image = document.querySelector('.closeup__image');
    const url = image ? image.src : window.location.href;
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(url).then(function() {
      btn.textContent = '복사됨';
      setTimeout(function() {
        btn.textContent = '링크';
      }, 1200);
    });
  }

  function closeCloseupFloatingLayers() {
    const shareLayer = document.getElementById(CLOSEUP_SHARE_SHEET_ID);
    const moreLayer = document.getElementById(CLOSEUP_MORE_MENU_ID);
    if (shareLayer) shareLayer.remove();
    if (moreLayer) moreLayer.remove();
    document.querySelectorAll('.closeup__icon-btn--active').forEach(function(btn) {
      if (btn.getAttribute('aria-label') === '좋아요') return;
      btn.classList.remove('closeup__icon-btn--active');
    });
  }

  function resetCloseupActionState(closeupView) {
    closeCloseupFloatingLayers();
    const likeBtn = closeupView.querySelector('.closeup__icon-btn[aria-label="좋아요"]');
    const likePath = likeBtn ? likeBtn.querySelector('path') : null;
    const saveBtn = closeupView.querySelector('.closeup__save-btn');
    if (likeBtn) likeBtn.classList.remove('closeup__icon-btn--liked');
    if (likePath) likePath.setAttribute('d', CLOSEUP_LIKE_OUTLINE_PATH);
    if (saveBtn) {
      saveBtn.classList.remove('closeup__save-btn--saved');
      saveBtn.textContent = '찜';
    }
  }

// ─── 이미지 라이트박스 ────────────────────────────────
  function openImageLightbox() {
    const img = document.querySelector('.closeup__image');
    if (!img || !img.src) return;

    // 이미 열려있으면 무시
    if (document.getElementById('imageLightbox')) return;

    const lightbox = document.createElement('div');
    lightbox.id = 'imageLightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML =
        '<div class="lightbox__backdrop"></div>' +
        '<button class="lightbox__close-btn" aria-label="닫기">' +
        '<svg viewBox="0 0 24 24" width="24" height="24"><path d="m15.18 12 7.16-7.16-3.18-3.18L12 8.82 4.84 1.66 1.66 4.84 8.82 12l-7.16 7.16 3.18 3.18L12 15.18l7.16 7.16 3.18-3.18z"></path></svg>' +
        '</button>' +
        '<div class="lightbox__container">' +
        '<img class="lightbox__image" src="' + img.src + '" alt="' + (img.alt || '') + '">' +
        '</div>';

    document.body.appendChild(lightbox);

    // 열기 애니메이션
    requestAnimationFrame(function() {
      lightbox.classList.add('lightbox--open');
    });

    // 닫기: 배경 클릭
    lightbox.querySelector('.lightbox__backdrop').addEventListener('click', closeImageLightbox);
    // 닫기: X 버튼
    lightbox.querySelector('.lightbox__close-btn').addEventListener('click', closeImageLightbox);
    // 닫기: ESC (기존 ESC 핸들러보다 먼저 처리)
    lightbox._escHandler = function(e) {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        closeImageLightbox();
      }
    };
    document.addEventListener('keydown', lightbox._escHandler, true);

    // body 스크롤 잠금
    document.body.style.overflow = 'hidden';
  }

  function closeImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (!lightbox) return;

    lightbox.classList.remove('lightbox--open');
    lightbox.classList.add('lightbox--closing');

    // ESC 핸들러 제거
    if (lightbox._escHandler) {
      document.removeEventListener('keydown', lightbox._escHandler, true);
    }

    // body 스크롤 복원
    document.body.style.overflow = '';

    // 애니메이션 후 DOM 제거
    setTimeout(function() {
      if (lightbox.parentNode) lightbox.parentNode.removeChild(lightbox);
    }, 250);
  }

// ─── 보드 선택 찜 ────────────────────────────────
  function saveToBoard(event, select) {
    event.stopPropagation();
    if (!select.value) return;
    const card = select.closest('.art-gallery-card');
    const saveBtn = card.querySelector('.art-gallery-card__save-btn');
    saveBtn.classList.add('art-gallery-card__save-btn--saved');
    saveBtn.textContent = '찜 완료';
    select.value = '';
  }

// ─── 핀 상세 Closeup 뷰 ──────────────────────────────
  function openPinDetail(cardEl) {
    const pinId = cardEl.getAttribute('data-id');
    const pin = pinStore.get(pinId);
    const img = cardEl.querySelector('.art-gallery-card__image');
    const title = cardEl.querySelector('.art-gallery-card__title');
    const closeupView = document.getElementById('closeupView');
    const closeupImage = closeupView.querySelector('.closeup__image');
    const closeupTitle = closeupView.querySelector('.closeup__title');
    const closeupDescription = closeupView.querySelector('.closeup__description-text');
    const creatorAvatar = closeupView.querySelector('.closeup__creator-avatar');
    const creatorName = closeupView.querySelector('.closeup__creator-name');
    const creatorHandle = closeupView.querySelector('.closeup__creator-handle');
    const statCount = closeupView.querySelector('.closeup__stat-count');
    const imageWrap = closeupView.querySelector('.closeup__image-wrap');
    activeCloseupPinId = pinId;
    resetCloseupActionState(closeupView);

    closeupImage.src = img.src;
    closeupImage.alt = img.alt;
    closeupTitle.textContent = title.textContent;
    closeupDescription.textContent = pin ? pin.description : '작품 설명이 여기에 표시됩니다.';
    creatorAvatar.src = pin ? pin.author.avatar : '';
    creatorAvatar.alt = pin ? pin.author.name : '';
    creatorName.textContent = pin ? pin.author.name : '크리에이터';
    creatorHandle.textContent = pin ? '@' + pin.author.name : '';
    statCount.textContent = pin ? String(pin.saves) : '112';
    imageWrap.style.aspectRatio = '1920 / 1080';

    const badgeContainer = closeupView.querySelector('.closeup__creator-badges');
    badgeContainer.innerHTML = '';
    const badgeCount = Math.floor(Math.random() * 3);
    const shuffled = BADGE_IMAGES.slice().sort(() => Math.random() - 0.5);
    for (let i = 0; i < badgeCount; i++) {
      const img = document.createElement('img');
      img.className = 'closeup__creator-badge';
      img.src = BADGE_BASE_PATH + shuffled[i];
      img.alt = BADGE_LABELS[shuffled[i]] || shuffled[i];
      img.title = BADGE_LABELS[shuffled[i]] || shuffled[i];
      img.width = 20;
      img.height = 20;
      badgeContainer.appendChild(img);
    }

    if (!window.isCloseupOpen) {
      savedScrollY = window.scrollY;
      history.pushState({ closeup: true }, '');
    } else {
      history.replaceState({ closeup: true }, '');
    }

    document.body.classList.add('closeup-open');
    closeupView.style.display = 'block';
    window.isCloseupOpen = true;
    window.scrollTo(0, 0);
    setupCloseupScrollShadow();
    initCommentComposer();
    loadRelatedPins(pinId);
  }

  function closeCloseupView() {
    teardownCloseupScrollShadow();
    const closeupView = document.getElementById('closeupView');
    resetCloseupActionState(closeupView);
    document.body.classList.remove('closeup-open');
    closeupView.style.display = 'none';
    window.isCloseupOpen = false;
    activeCloseupPinId = null;
    closeupSeed = 0;
    closeupOffset = 0;
    document.getElementById('closeupRelatedPins').innerHTML = '';
    document.getElementById('closeupBelowPins').innerHTML = '';
    window.scrollTo(0, savedScrollY);
  }

  function loadRelatedPins(activePinId) {
    document.getElementById('closeupRelatedPins').innerHTML = '';
    document.getElementById('closeupBelowPins').innerHTML = '';
    closeupSeed = Math.floor(Math.random() * 1000);
    closeupOffset = 0;
    appendCloseupPins(BATCH_SIZE, activePinId);
  }

  function appendCloseupPins(count, activePinId) {
    const sideContainer = document.getElementById('closeupRelatedPins');
    const belowContainer = document.getElementById('closeupBelowPins');
    const targetPinId = activePinId || activeCloseupPinId;
    const relatedPins = generatePins(count, closeupSeed + closeupOffset).filter(function(pin) {
      return pin.id !== targetPinId;
    });
    closeupOffset += count;
    const temp = document.createElement('div');
    const sideFragment = document.createDocumentFragment();
    const belowFragment = document.createDocumentFragment();
    let sideCount = sideContainer.childElementCount;
    let belowCount = belowContainer.childElementCount;

    relatedPins.forEach(function(pin) {
      temp.innerHTML = createArtGalleryCardHTML(pin);
      const card = temp.firstElementChild;
      if (sideCount <= belowCount) {
        sideFragment.appendChild(card);
        sideCount += 1;
      } else {
        belowFragment.appendChild(card);
        belowCount += 1;
      }
    });
    sideContainer.appendChild(sideFragment);
    belowContainer.appendChild(belowFragment);
  }

  function initCommentComposer() {
    const input = document.querySelector('.closeup__comment-input');
    const submitBtn = document.querySelector('.closeup__submit-btn');
    if (!input || !submitBtn || commentComposerInitialized) return;

    input.addEventListener('input', function() {
      const hasContent = this.textContent.trim().length > 0;
      submitBtn.classList.toggle('closeup__submit-btn--visible', hasContent);
    });

    // Enter로 댓글 등록 (Shift+Enter는 줄바꿈)
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitComment();
      }
    });

    submitBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      submitComment();
    });

    commentComposerInitialized = true;
  }

  function submitComment() {
    if (!IS_LOGGED_IN) { showAuthModal(); return; }
    const input = document.querySelector('.closeup__comment-input');
    const submitBtn = document.querySelector('.closeup__submit-btn');
    const text = input.textContent.trim();
    if (!text) return;

    const commentsSection = document.querySelector('.closeup__comments');
    const content = commentsSection.querySelector('.closeup__collapsible-content');
    const header = commentsSection.querySelector('.closeup__collapsible-header');

    // 빈 댓글 안내 메시지 제거
    const emptyMsg = content.querySelector('.closeup__comments-empty');
    if (emptyMsg) emptyMsg.remove();

    // 댓글 요소 생성
    const comment = document.createElement('div');
    comment.className = 'closeup__comment-item';
    comment.innerHTML =
        '<img class="closeup__comment-avatar" src="' + createAvatarDataUri('나', 21) + '" alt="나">' +
        '<div class="closeup__comment-body">' +
        '<div class="closeup__comment-meta">' +
        '<span class="closeup__comment-author">나</span>' +
        '<span class="closeup__comment-time">방금</span>' +
        '</div>' +
        '<p class="closeup__comment-text">' + text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p>' +
        '<div class="closeup__comment-actions">' +
        '<span class="closeup__comment-like-count">0</span>' +
        '<button class="closeup__comment-like-btn" onclick="toggleCommentLike(this)">좋아요</button>' +
        '</div>' +
        '</div>';
    content.appendChild(comment);

    // 댓글 수 업데이트
    const count = content.querySelectorAll('.closeup__comment-item').length;
    header.childNodes[0].textContent = '댓글 ' + count + '개 ';

    // 펼쳐진 상태로
    if (!commentsSection.classList.contains('closeup__comments--open')) {
      commentsSection.classList.add('closeup__comments--open');
      content.style.height = 'auto';
    }

    // 입력 초기화
    input.textContent = '';
    submitBtn.classList.remove('closeup__submit-btn--visible');
    input.focus();
  }

  function toggleCommentLike(btn) {
    const countEl = btn.parentElement.querySelector('.closeup__comment-like-count');
    const isActive = btn.classList.toggle('closeup__comment-like-btn--active');
    let count = parseInt(countEl.textContent) || 0;
    count = isActive ? count + 1 : count - 1;
    countEl.textContent = count;
    countEl.style.display = count > 0 ? '' : 'none';
  }

  function toggleSend(btn) {
    const isSent = btn.classList.toggle('closeup-share-sheet__send--sent');
    btn.textContent = isSent ? '보냄' : '보내기';
  }

  function toggleFollow(btn) {
    if (!IS_LOGGED_IN) { showAuthModal(); return; }
    const isFollowing = btn.classList.toggle('closeup__creator-follow--following');
    btn.textContent = isFollowing ? '팔로잉' : '팔로우';
  }

  function toggleCloseupCollapsible(headerEl) {
    const collapsible = headerEl.closest('.closeup__comments');
    const content = collapsible.querySelector('.closeup__collapsible-content');
    const isOpen = collapsible.classList.contains('closeup__comments--open');

    if (isOpen) {
      content.style.height = content.scrollHeight + 'px';
      requestAnimationFrame(() => {
        content.style.height = '0';
      });
      collapsible.classList.remove('closeup__comments--open');
    } else {
      collapsible.classList.add('closeup__comments--open');
      content.style.height = content.scrollHeight + 'px';
      content.addEventListener('transitionend', function handler() {
        content.style.height = 'auto';
        content.removeEventListener('transitionend', handler);
      });
    }
  }

// ─── 스크롤 기반 back 버튼 그림자 ──────────────────
  function setupCloseupScrollShadow() {
    const backBtn = document.querySelector('.closeup__back-btn');
    if (!backBtn) return;
    if (closeupScrollHandler) {
      window.removeEventListener('scroll', closeupScrollHandler);
    }
    backBtn.classList.add('closeup__back-btn--no-shadow');

    closeupScrollHandler = function() {
      if (window.scrollY > 20) {
        backBtn.classList.remove('closeup__back-btn--no-shadow');
        backBtn.classList.add('closeup__back-btn--shadow');
      } else {
        backBtn.classList.remove('closeup__back-btn--shadow');
        backBtn.classList.add('closeup__back-btn--no-shadow');
      }
    };
    window.addEventListener('scroll', closeupScrollHandler, { passive: true });
  }

  function teardownCloseupScrollShadow() {
    if (closeupScrollHandler) {
      window.removeEventListener('scroll', closeupScrollHandler);
      closeupScrollHandler = null;
    }
  }

// popstate 리스너 (브라우저 뒤로가기)
  window.addEventListener('popstate', function(e) {
    if (window.isCloseupOpen) {
      closeCloseupView();
    }
  });

// ─── 공유 메뉴 ─────────────────────────────────────
  function sharePinMenu(event, btn) {
    event.stopPropagation();
    closeAllMenus();
    const card = btn.closest('.art-gallery-card');
    const existing = card.querySelector('.context-menu');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML =
        '<div class="context-menu__title">공유</div>' +
        '<button class="context-menu__item" onclick="event.stopPropagation(); copyPinLink(this)">링크 복사</button>' +
        '<button class="context-menu__item" onclick="event.stopPropagation()">Facebook</button>' +
        '<button class="context-menu__item" onclick="event.stopPropagation()">X (Twitter)</button>' +
        '<button class="context-menu__item" onclick="event.stopPropagation()">WhatsApp</button>';
    btn.closest('.art-gallery-card__action-group').appendChild(menu);
  }

  function copyPinLink(btn) {
    const card = btn.closest('.art-gallery-card');
    const img = card.querySelector('.art-gallery-card__image');
    navigator.clipboard.writeText(img.src).then(function() {
      showToast('클립보드에 공유할 링크를 복사했습니다');
    });
  }

// ─── 더보기 메뉴 ────────────────────────────────────
  function morePinMenu(event, btn) {
    event.stopPropagation();
    closeAllMenus();
    const card = btn.closest('.art-gallery-card');
    const existing = card.querySelector('.context-menu');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML =
        '<button class="context-menu__item" onclick="event.stopPropagation()">작품 신고</button>' +
        '<button class="context-menu__item" onclick="event.stopPropagation(); hidePinCard(this)">이 작품 숨기기</button>'
    btn.closest('.art-gallery-card__action-group').appendChild(menu);
  }

  function hidePinCard(btn) {
    const card = btn.closest('.art-gallery-card');
    card.style.transition = 'opacity 0.3s, transform 0.3s';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.8)';
    setTimeout(function() { card.remove(); }, 300);
  }

  window.closeAllMenus = function() {
    document.querySelectorAll('.context-menu').forEach(function(m) { m.remove(); });
    closeCloseupFloatingLayers();
  };
  window.closeCloseupView = closeCloseupView;
});


