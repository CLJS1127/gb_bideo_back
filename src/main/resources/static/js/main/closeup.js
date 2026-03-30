// ─── Closeup View (depends on main.js globals) ──────────────
// Globals used from main.js: IS_LOGGED_IN, pinStore, createAvatarDataUri(),
//   showToast(), LOCAL_PROFILE_IMAGE, fetchGalleries(), mapGalleryToPin(),
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
  let activeGalleryDetail = null;
  let closeupSeed = 0;
  let closeupOffset = 0;
  let closeupScrollHandler = null;
  let isGalleryLikePending = false;
  let isGalleryBookmarkPending = false;
  let isGalleryCommentPending = false;

  function isGalleryCloseup(pinId) {
    const targetPinId = pinId || activeCloseupPinId;
    return typeof targetPinId === 'string' && targetPinId.startsWith('gallery-');
  }

  function getActiveGalleryId() {
    if (!isGalleryCloseup()) return null;
    return Number(String(activeCloseupPinId).replace('gallery-', ''));
  }

  function getGalleryIdFromButton(btn) {
    if (btn.classList.contains('closeup__save-btn')) {
      return getActiveGalleryId();
    }

    const card = btn.closest('.art-gallery-card');
    const pinId = card ? card.getAttribute('data-id') : null;
    if (!pinId || !pinId.startsWith('gallery-')) return null;
    return Number(pinId.replace('gallery-', ''));
  }

  function showCloseupMessage(message, type) {
    const text = String(message || '');
    if (!text) return;

    if (typeof BideoSnackbar !== 'undefined') {
      BideoSnackbar.show(text, type || 'info');
      return;
    }

    if (typeof showToast === 'function') {
      showToast(text);
      return;
    }

    window.alert(text);
  }

  function showNotReadyMessage(message) {
    showCloseupMessage(message || '준비 중입니다.', 'info');
  }

  async function readErrorMessage(response, fallback) {
    const text = (await response.text()).trim();
    if (!text || text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      return fallback;
    }
    return text;
  }

  function updateCloseupCommentHeader(count) {
    const header = document.querySelector('.closeup__collapsible-header');
    if (!header) return;
    const textNode = Array.from(header.childNodes).find(function(node) {
      return node.nodeType === Node.TEXT_NODE;
    });
    const label = '댓글 ' + count + '개 ';
    if (textNode) {
      textNode.textContent = label;
      return;
    }
    header.prepend(document.createTextNode(label));
  }

  function setCommentComposerEnabled(enabled, disabledMessage) {
    const input = document.querySelector('.closeup__comment-input');
    const submitBtn = document.querySelector('.closeup__submit-btn');
    if (!input || !submitBtn) return;

    input.textContent = '';
    input.setAttribute('contenteditable', enabled ? 'true' : 'false');
    input.setAttribute(
        'data-placeholder',
        enabled ? '댓글을 추가하고 대화를 시작하세요.' : (disabledMessage || '댓글 작성이 비활성화되었습니다.')
    );
    submitBtn.classList.remove('closeup__submit-btn--visible');
    submitBtn.style.display = enabled ? '' : 'none';
  }

  function escapeCommentHtml(text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, function(char) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;'
      })[char];
    });
  }

  function formatCommentTimestamp(createdDatetime) {
    if (!createdDatetime) return '방금';
    const parsed = new Date(createdDatetime);
    if (Number.isNaN(parsed.getTime())) return '방금';
    return parsed.toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function updateCloseupLikeUi(liked, likeCount) {
    const closeupView = document.getElementById('closeupView');
    const likeBtn = closeupView ? closeupView.querySelector('.closeup__icon-btn[aria-label="좋아요"]') : null;
    const likePath = likeBtn ? likeBtn.querySelector('path') : null;
    const countEl = closeupView ? closeupView.querySelector('.closeup__stat-count') : null;

    if (likeBtn) {
      likeBtn.classList.toggle('closeup__icon-btn--liked', Boolean(liked));
    }
    if (likePath) {
      likePath.setAttribute('d', liked ? CLOSEUP_LIKE_FILLED_PATH : CLOSEUP_LIKE_OUTLINE_PATH);
    }
    if (countEl) {
      countEl.textContent = String(Number(likeCount || 0));
    }

    if (activeGalleryDetail) {
      activeGalleryDetail.isLiked = Boolean(liked);
      activeGalleryDetail.likeCount = Number(likeCount || 0);
      const pin = pinStore.get('gallery-' + activeGalleryDetail.id);
      if (pin) {
        pin.saves = activeGalleryDetail.likeCount;
      }
    }
  }

  function updateCloseupBookmarkUi(bookmarked) {
    const closeupView = document.getElementById('closeupView');
    const saveBtn = closeupView ? closeupView.querySelector('.closeup__save-btn') : null;
    if (saveBtn) {
      saveBtn.classList.toggle('closeup__save-btn--saved', Boolean(bookmarked));
      saveBtn.textContent = bookmarked ? '찜 완료' : '찜';
    }

    if (activeGalleryDetail) {
      activeGalleryDetail.isBookmarked = Boolean(bookmarked);
    }
  }

  function updateCardBookmarkUi(galleryId, bookmarked) {
    document.querySelectorAll('.art-gallery-card[data-id="gallery-' + galleryId + '"] .art-gallery-card__save-btn')
        .forEach(function(button) {
          button.classList.toggle('art-gallery-card__save-btn--saved', Boolean(bookmarked));
          button.textContent = bookmarked ? '찜 완료' : '찜';
        });
  }

  function renderCloseupComments(comments) {
    const commentsSection = document.querySelector('.closeup__comments');
    const content = commentsSection ? commentsSection.querySelector('.closeup__collapsible-content') : null;
    if (!commentsSection || !content) return;

    const list = Array.isArray(comments) ? comments : [];
    updateCloseupCommentHeader(list.length);

    if (!list.length) {
      const emptyText = activeGalleryDetail && activeGalleryDetail.allowComment === false
          ? '이 예술관은 댓글 작성이 비활성화되어 있습니다.'
          : '댓글을 추가하고 대화를 시작하세요.';
      content.innerHTML = '<p class="closeup__comments-empty">' + escapeCommentHtml(emptyText) + '</p>';
      return;
    }

    content.innerHTML = list.map(function(comment) {
      const profileImage = comment.memberProfileImage || LOCAL_PROFILE_IMAGE;
      const likeCount = Number(comment.likeCount || 0);
      const likeCountHtml = likeCount > 0
          ? '<span class="closeup__comment-like-count">' + likeCount + '</span>'
          : '<span class="closeup__comment-like-count" style="display:none;">0</span>';

      return '' +
          '<div class="closeup__comment-item">' +
          '<img class="closeup__comment-avatar" src="' + profileImage + '" alt="' + escapeCommentHtml(comment.memberNickname || 'user') + '">' +
          '<div class="closeup__comment-body">' +
          '<div class="closeup__comment-meta">' +
          '<span class="closeup__comment-author">' + escapeCommentHtml(comment.memberNickname || 'user') + '</span>' +
          '<span class="closeup__comment-time">' + escapeCommentHtml(formatCommentTimestamp(comment.createdDatetime)) + '</span>' +
          '</div>' +
          '<p class="closeup__comment-text">' + escapeCommentHtml(comment.content || '') + '</p>' +
          '<div class="closeup__comment-actions">' +
          likeCountHtml +
          '<button class="closeup__comment-like-btn" type="button" data-action="toggle-comment-like" data-comment-id="' + Number(comment.id || 0) + '">좋아요</button>' +
          '</div>' +
          '</div>' +
          '</div>';
    }).join('');
  }

  async function loadGalleryComments(galleryId) {
    const response = await fetch('/api/galleries/' + galleryId + '/comments');
    if (!response.ok) {
      throw new Error(await readErrorMessage(response, '예술관 댓글을 불러오지 못했습니다.'));
    }
    const comments = await response.json();
    renderCloseupComments(comments);
    if (activeGalleryDetail) {
      activeGalleryDetail.commentCount = Array.isArray(comments) ? comments.length : 0;
    }
  }

// ─── 찜 버튼 토글 (카드/클로즈업 통합) ──────────────
  async function toggleSave(event, btn) {
    if (event) event.stopPropagation();
    if (!IS_LOGGED_IN) { showAuthModal(); return; }
    const galleryId = getGalleryIdFromButton(btn);
    if (!galleryId) {
      const isCloseup = btn.classList.contains('closeup__save-btn');
      const savedClass = isCloseup ? 'closeup__save-btn--saved' : 'art-gallery-card__save-btn--saved';
      const isSaved = btn.classList.toggle(savedClass);
      btn.textContent = isSaved ? '찜 완료' : '찜';
      return;
    }
    if (isGalleryBookmarkPending) return;

    const previousBookmarked = btn.classList.contains('closeup__save-btn')
        ? Boolean(activeGalleryDetail && activeGalleryDetail.isBookmarked)
        : btn.classList.contains('art-gallery-card__save-btn--saved');
    const nextBookmarked = !previousBookmarked;

    isGalleryBookmarkPending = true;
    if (btn.classList.contains('closeup__save-btn')) {
      updateCloseupBookmarkUi(nextBookmarked);
    }
    updateCardBookmarkUi(galleryId, nextBookmarked);

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetType: 'GALLERY',
          targetId: galleryId
        })
      });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, '예술관 찜 처리에 실패했습니다.'));
      }

      const result = await response.json();
      const bookmarked = Boolean(result.bookmarked);
      if (btn.classList.contains('closeup__save-btn')) {
        updateCloseupBookmarkUi(bookmarked);
      }
      updateCardBookmarkUi(galleryId, bookmarked);
    } catch (error) {
      if (btn.classList.contains('closeup__save-btn')) {
        updateCloseupBookmarkUi(previousBookmarked);
      }
      updateCardBookmarkUi(galleryId, previousBookmarked);
      showCloseupMessage(error.message || '예술관 찜 처리에 실패했습니다.', 'error');
    } finally {
      isGalleryBookmarkPending = false;
    }
  }

  async function toggleCloseupLike(btn) {
    if (!IS_LOGGED_IN) { showAuthModal(); return; }
    if (activeGalleryDetail && activeGalleryDetail.id) {
      if (isGalleryLikePending) return;

      const previousLiked = Boolean(activeGalleryDetail.isLiked);
      const previousLikeCount = Number(activeGalleryDetail.likeCount || 0);
      const nextLiked = !previousLiked;
      const nextLikeCount = nextLiked ? previousLikeCount + 1 : Math.max(0, previousLikeCount - 1);

      isGalleryLikePending = true;
      updateCloseupLikeUi(nextLiked, nextLikeCount);

      try {
        const response = await fetch('/api/galleries/' + activeGalleryDetail.id + '/likes', {
          method: 'POST'
        });
        if (!response.ok) {
          throw new Error(await readErrorMessage(response, '예술관 좋아요 처리에 실패했습니다.'));
        }

        const result = await response.json();
        updateCloseupLikeUi(Boolean(result.liked), Number(result.likeCount || 0));
      } catch (error) {
        updateCloseupLikeUi(previousLiked, previousLikeCount);
        showCloseupMessage(error.message || '예술관 좋아요 처리에 실패했습니다.', 'error');
      } finally {
        isGalleryLikePending = false;
      }
      return;
    }

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
        '<div class="closeup-share-sheet__social"><button class="closeup-share-sheet__social-btn" type="button" data-action="copy-closeup-link">링크</button><span>링크 복사</span></div>' +
        '<div class="closeup-share-sheet__social"><button class="closeup-share-sheet__social-btn closeup-share-sheet__social-btn--dark" type="button">W</button><span>WhatsApp</span></div>' +
        '<div class="closeup-share-sheet__social"><button class="closeup-share-sheet__social-btn" type="button">M</button><span>메신저</span></div>' +
        '<div class="closeup-share-sheet__social"><button class="closeup-share-sheet__social-btn" type="button">f</button><span>Facebook</span></div>' +
        '<div class="closeup-share-sheet__social"><button class="closeup-share-sheet__social-btn closeup-share-sheet__social-btn--dark" type="button">X</button><span>X</span></div>' +
        '</div>' +
        '<input class="closeup-share-sheet__search" id="contactSearch" type="search" placeholder="이름 또는 이메일 검색" aria-label="검색 필드">' +
        '<div class="closeup-share-sheet__contacts">' +
        '<div class="closeup-share-sheet__contact"><img src="' + LOCAL_PROFILE_IMAGE + '" alt="정찬호"><div class="closeup-share-sheet__contact-copy"><span class="closeup-share-sheet__contact-name">정찬호</span><span class="closeup-share-sheet__contact-handle">@chanho8629</span></div><button class="closeup-share-sheet__send" type="button" data-action="toggle-send">보내기</button></div>' +
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
        '<button class="closeup-more-menu__item" type="button" data-action="unsupported-gallery-action" data-message="비슷한 예술관 기능은 준비 중입니다.">비슷한 예술관 더 보기</button>' +
        '<button class="closeup-more-menu__item" type="button" data-action="unsupported-gallery-action" data-message="비슷한 예술관 기능은 준비 중입니다.">비슷한 예술관 덜 보기</button>' +
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
  async function openPinDetail(cardEl) {
    const pinId = cardEl.getAttribute('data-id');
    if (pinId && pinId.startsWith('gallery-')) {
      await openGalleryDetail(pinId.replace('gallery-', ''), cardEl);
      return;
    }
    var pin = pinStore.get(pinId);
    // API fallback: pinStore에 없으면 상세 조회
    if (!pin && pinId && pinId.startsWith('gallery-')) {
      try {
        var galleryId = pinId.replace('gallery-', '');
        var res = await fetch('/api/galleries/' + galleryId);
        if (res.ok) {
          var detail = await res.json();
          pin = mapGalleryToPin(detail);
          pin.description = detail.description || '';
          pinStore.set(pinId, pin);
        }
      } catch (e) { console.error('예술관 상세 조회 실패:', e); }
    }
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
    const creatorAvatarMeta = resolveCreatorAvatar(pin);
    creatorAvatar.onerror = function() {
      this.onerror = null;
      this.src = creatorAvatarMeta.fallback;
    };
    creatorAvatar.src = creatorAvatarMeta.src;
    creatorAvatar.alt = creatorAvatarMeta.alt;
    creatorName.textContent = creatorAvatarMeta.alt;
    creatorHandle.textContent = pin && pin.author && pin.author.name ? '@' + pin.author.name : '';
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
    activeGalleryDetail = null;
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

  let closeupPage = 1;
  let closeupHasMore = true;

  function loadRelatedPins(activePinId) {
    document.getElementById('closeupRelatedPins').innerHTML = '';
    document.getElementById('closeupBelowPins').innerHTML = '';
    closeupPage = 1;
    closeupHasMore = true;
    closeupOffset = 0;
    appendCloseupPins(BATCH_SIZE, activePinId);
  }

  async function appendCloseupPins(count, activePinId) {
    if (!closeupHasMore) return;
    var sideContainer = document.getElementById('closeupRelatedPins');
    var belowContainer = document.getElementById('closeupBelowPins');
    var targetPinId = activePinId || activeCloseupPinId;
    try {
      var data = await fetchGalleries(closeupPage, count);
      var relatedPins = (data.content || []).map(mapGalleryToPin).filter(function(pin) {
        return pin.id !== targetPinId;
      });
      relatedPins.forEach(function(p) { pinStore.set(p.id, p); });
      closeupPage++;
      closeupHasMore = closeupPage <= (data.totalPages || 1);
    } catch (e) {
      console.error('관련 작품 로드 실패:', e);
      return;
    }
    var temp = document.createElement('div');
    var sideFragment = document.createDocumentFragment();
    var belowFragment = document.createDocumentFragment();
    var sideCount = sideContainer.childElementCount;
    var belowCount = belowContainer.childElementCount;

    relatedPins.forEach(function(pin) {
      temp.innerHTML = createArtGalleryCardHTML(pin);
      var card = temp.firstElementChild;
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

  async function submitComment() {
    if (!IS_LOGGED_IN) { showAuthModal(); return; }
    const input = document.querySelector('.closeup__comment-input');
    const submitBtn = document.querySelector('.closeup__submit-btn');
    const text = input.textContent.trim();
    if (!text) return;
    if (input.getAttribute('contenteditable') === 'false') return;

    if (activeGalleryDetail && activeGalleryDetail.id) {
      if (isGalleryCommentPending) return;
      isGalleryCommentPending = true;

      try {
        const response = await fetch('/api/galleries/' + activeGalleryDetail.id + '/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            targetType: 'GALLERY',
            targetId: activeGalleryDetail.id,
            content: text
          })
        });
        if (!response.ok) {
          throw new Error(await readErrorMessage(response, '예술관 댓글 등록에 실패했습니다.'));
        }

        const comments = await response.json();
        renderCloseupComments(comments);
        input.textContent = '';
        submitBtn.classList.remove('closeup__submit-btn--visible');
        input.focus();
      } catch (error) {
        showCloseupMessage(error.message || '예술관 댓글 등록에 실패했습니다.', 'error');
      } finally {
        isGalleryCommentPending = false;
      }
      return;
    }

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
        '<img class="closeup__comment-avatar" src="' + LOCAL_PROFILE_IMAGE + '" alt="나">' +
        '<div class="closeup__comment-body">' +
        '<div class="closeup__comment-meta">' +
        '<span class="closeup__comment-author">나</span>' +
        '<span class="closeup__comment-time">방금</span>' +
        '</div>' +
        '<p class="closeup__comment-text">' + text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p>' +
        '<div class="closeup__comment-actions">' +
        '<span class="closeup__comment-like-count">0</span>' +
        '<button class="closeup__comment-like-btn" type="button" data-action="toggle-comment-like">좋아요</button>' +
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
    if (activeGalleryDetail && activeGalleryDetail.id) {
      showNotReadyMessage('예술관 댓글 좋아요 기능은 준비 중입니다.');
      return;
    }
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
    showNotReadyMessage('작성자 팔로우 기능은 준비 중입니다.');
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

  function resolveCreatorAvatar(pin) {
    const authorName = pin && pin.author && pin.author.name ? pin.author.name : '크리에이터';
    const avatarSrc = pin && pin.author && pin.author.avatar ? pin.author.avatar : LOCAL_PROFILE_IMAGE;

    return {
      src: avatarSrc,
      fallback: LOCAL_PROFILE_IMAGE,
      alt: authorName
    };
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
        '<button class="context-menu__item" type="button" data-action="copy-pin-link">링크 복사</button>' +
        '<button class="context-menu__item" type="button">Facebook</button>' +
        '<button class="context-menu__item" type="button">X (Twitter)</button>' +
        '<button class="context-menu__item" type="button">WhatsApp</button>';
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
        '<button class="context-menu__item" type="button">작품 신고</button>' +
        '<button class="context-menu__item" type="button" data-action="hide-pin-card">이 작품 숨기기</button>'
    btn.closest('.art-gallery-card__action-group').appendChild(menu);
  }

  function hidePinCard(btn) {
    const card = btn.closest('.art-gallery-card');
    card.style.transition = 'opacity 0.3s, transform 0.3s';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.8)';
    setTimeout(function() { card.remove(); }, 300);
  }

  document.addEventListener('click', function(event) {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) return;

    switch (actionTarget.dataset.action) {
      case 'open-pin-detail':
        if (typeof window.closeAllMenus === 'function') {
          window.closeAllMenus();
        }
        openPinDetail(actionTarget.closest('.art-gallery-card') || actionTarget);
        break;
      case 'toggle-pin-save':
      case 'toggle-closeup-save':
        toggleSave(event, actionTarget);
        break;
      case 'share-pin-menu':
        sharePinMenu(event, actionTarget);
        break;
      case 'more-pin-menu':
        morePinMenu(event, actionTarget);
        break;
      case 'close-closeup':
        closeCloseupView();
        break;
      case 'open-image-lightbox':
        openImageLightbox();
        break;
      case 'toggle-closeup-like':
        toggleCloseupLike(actionTarget);
        break;
      case 'toggle-closeup-share':
        toggleCloseupShareMenu(event, actionTarget);
        break;
      case 'toggle-closeup-more':
        toggleCloseupMoreMenu(event, actionTarget);
        break;
      case 'focus-closeup-details':
        focusCloseupDetails();
        break;
      case 'toggle-follow':
        toggleFollow(actionTarget);
        break;
      case 'toggle-closeup-collapsible':
        toggleCloseupCollapsible(actionTarget);
        break;
      case 'copy-closeup-link':
        event.stopPropagation();
        copyCloseupLink(actionTarget);
        break;
      case 'toggle-send':
        toggleSend(actionTarget);
        break;
      case 'toggle-comment-like':
        toggleCommentLike(actionTarget);
        break;
      case 'unsupported-gallery-action':
        event.stopPropagation();
        showNotReadyMessage(actionTarget.dataset.message);
        closeCloseupFloatingLayers();
        break;
      case 'copy-pin-link':
        event.stopPropagation();
        copyPinLink(actionTarget);
        break;
      case 'hide-pin-card':
        event.stopPropagation();
        hidePinCard(actionTarget);
        break;
      default:
        break;
    }
  });

  async function openGalleryDetail(galleryId, cardEl) {
    try {
      const res = await fetch('/api/galleries/' + galleryId);
      if (!res.ok) throw new Error(await readErrorMessage(res, '예술관 상세를 불러오지 못했습니다.'));
      const gallery = await res.json();

      const closeupView = document.getElementById('closeupView');
      const closeupImage = closeupView.querySelector('.closeup__image');
      const closeupTitle = closeupView.querySelector('.closeup__title');
      const closeupDescription = closeupView.querySelector('.closeup__description-text');
      const creatorAvatar = closeupView.querySelector('.closeup__creator-avatar');
      const creatorName = closeupView.querySelector('.closeup__creator-name');
      const creatorHandle = closeupView.querySelector('.closeup__creator-handle');
      const imageWrap = closeupView.querySelector('.closeup__image-wrap');

      activeCloseupPinId = 'gallery-' + galleryId;
      activeGalleryDetail = gallery;
      resetCloseupActionState(closeupView);

      const fallbackImage = cardEl && cardEl.querySelector('.art-gallery-card__image')
          ? cardEl.querySelector('.art-gallery-card__image').src
          : '/images/BIDEO_LOGO/BIDEO_favicon.png';
      closeupImage.src = gallery.coverImage || fallbackImage;
      closeupImage.alt = gallery.title || '';
      closeupTitle.textContent = gallery.title || '';
      closeupDescription.textContent = gallery.description || '예술관 설명이 아직 없습니다.';

      const authorName = gallery.memberNickname || '크리에이터';
      creatorAvatar.onerror = function() {
        this.onerror = null;
        this.src = LOCAL_PROFILE_IMAGE;
      };
      creatorAvatar.src = LOCAL_PROFILE_IMAGE;
      creatorAvatar.alt = authorName;
      creatorName.textContent = authorName;
      creatorHandle.textContent = '';
      imageWrap.style.aspectRatio = '16 / 9';
      updateCloseupLikeUi(Boolean(gallery.isLiked), Number(gallery.likeCount || 0));
      updateCloseupBookmarkUi(Boolean(gallery.isBookmarked));
      setCommentComposerEnabled(gallery.allowComment !== false, '이 예술관은 댓글 작성이 비활성화되어 있습니다.');
      renderCloseupComments([]);

      const badgeContainer = closeupView.querySelector('.closeup__creator-badges');
      badgeContainer.innerHTML = '';

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
      await loadGalleryComments(galleryId);

      // 관련 작품은 표시하지 않음
      document.getElementById('closeupRelatedPins').innerHTML = '';
      document.getElementById('closeupBelowPins').innerHTML = '';
    } catch (e) {
      console.error('예술관 상세 조회 실패:', e);
      showCloseupMessage(e.message || '예술관 상세 조회에 실패했습니다.', 'error');
    }
  }

  window.closeAllMenus = function() {
    document.querySelectorAll('.context-menu').forEach(function(m) { m.remove(); });
    closeCloseupFloatingLayers();
  };
  window.appendCloseupPins = appendCloseupPins;
  window.closeCloseupView = closeCloseupView;
  window.openGalleryDetail = openGalleryDetail;
});


