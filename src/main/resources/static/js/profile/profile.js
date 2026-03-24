// ─── 상수 & 전역 ─────────────────────────────────
const IS_OWNER = document.body.dataset.owner === 'true';
const RING_SIZE = 87;
const RING_RADIUS = 40.5;
const RING_ACTIVE = '#c4a84d';
const RING_GREY = 'rgb(219, 223, 228)';
let currentWorkDetail = null;
let currentGalleryDetail = null;
let workEditTags = [];
let workEditSelectedFile = null;
let workEditExistingMediaUrl = null;
let galleryEditSelectedFile = null;
let galleryEditExistingCoverUrl = null;
const workEditGallerySelect = document.getElementById('workEditGallerySelect');
const workEditGallerySelectWrap = document.getElementById('workEditGallerySelectWrap');
const workEditGallerySelectTrigger = document.getElementById('workEditGallerySelectTrigger');
const workEditGallerySelectTriggerText = workEditGallerySelectTrigger?.querySelector('.gallery-select-trigger-text');
const workEditGallerySelectList = document.getElementById('workEditGallerySelectList');
const workEditPreviewModal = document.getElementById('workEditPreviewModal');
const workEditPreviewMediaModal = document.getElementById('workEditPreviewMediaModal');
const workEditPreviewTitleModal = document.getElementById('workEditPreviewTitleModal');
const workEditPreviewDescriptionModal = document.getElementById('workEditPreviewDescriptionModal');
const workEditPreviewTagsModal = document.getElementById('workEditPreviewTagsModal');
const workEditPreviewPriceModal = document.getElementById('workEditPreviewPriceModal');

function syncWorkEditGallerySelectUI() {
  if (!workEditGallerySelect || !workEditGallerySelectTriggerText || !workEditGallerySelectList) return;

  const selectedOption = workEditGallerySelect.options[workEditGallerySelect.selectedIndex];
  workEditGallerySelectTriggerText.textContent = selectedOption?.textContent?.trim() || '선택 안 함';

  workEditGallerySelectList.querySelectorAll('.gallery-select-option').forEach((optionElement) => {
    const isSelected = optionElement.dataset.value === workEditGallerySelect.value;
    optionElement.classList.toggle('is-selected', isSelected);
    optionElement.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });
}

function closeWorkEditGallerySelect() {
  if (!workEditGallerySelectWrap || !workEditGallerySelectTrigger) return;
  workEditGallerySelectWrap.classList.remove('open');
  workEditGallerySelectTrigger.setAttribute('aria-expanded', 'false');
}

function initializeWorkEditGallerySelect() {
  if (!workEditGallerySelect || !workEditGallerySelectWrap || !workEditGallerySelectTrigger || !workEditGallerySelectList) return;

  syncWorkEditGallerySelectUI();

  workEditGallerySelectTrigger.addEventListener('click', () => {
    const shouldOpen = !workEditGallerySelectWrap.classList.contains('open');
    closeWorkEditGallerySelect();
    if (shouldOpen) {
      workEditGallerySelectWrap.classList.add('open');
      workEditGallerySelectTrigger.setAttribute('aria-expanded', 'true');
    }
  });

  workEditGallerySelectList.querySelectorAll('.gallery-select-option').forEach((optionElement) => {
    optionElement.addEventListener('click', () => {
      workEditGallerySelect.value = optionElement.dataset.value || '';
      syncWorkEditGallerySelectUI();
      closeWorkEditGallerySelect();
    });
  });

  document.addEventListener('click', (event) => {
    if (!workEditGallerySelectWrap.contains(event.target)) {
      closeWorkEditGallerySelect();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeWorkEditGallerySelect();
    }
  });
}

function getWorkEditUploadArea() {
  return document.getElementById('workEditUploadArea');
}

function resetWorkDetailSheetSize() {
  const mediaWrap = document.getElementById('workDetailMediaWrap');
  if (!mediaWrap) return;
  mediaWrap.style.height = '';
}

function fitWorkDetailSheetToMedia(mediaWidth, mediaHeight) {
  const mediaWrap = document.getElementById('workDetailMediaWrap');
  if (!mediaWrap || !mediaWidth || !mediaHeight) return;
  mediaWrap.style.height = '';
}

function formatWorkDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatWorkPrice(price) {
  if (price === null || price === undefined) return '';
  return `${Number(price).toLocaleString('ko-KR')}원`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderWorkComments(comments) {
  const commentsContainer = document.getElementById('workDetailCommentsContainer');
  if (!commentsContainer) return;

  if (!comments || !comments.length) {
    commentsContainer.innerHTML = `
      <div class="work-detail-comment-item">
        <img class="work-detail-comment-avatar" src="/images/BIDEO_LOGO/BIDEO_favicon.png" alt="empty">
        <div class="work-detail-comment-copy">
          <div class="work-detail-comment-body">
            <span class="work-detail-comment-name">comment</span>
            <span class="work-detail-comment-text">아직 댓글이 없습니다.</span>
          </div>
        </div>
      </div>
    `;
    return;
  }

  commentsContainer.innerHTML = comments.map((comment) => `
    <div class="work-detail-comment-item">
      <img class="work-detail-comment-avatar" src="${comment.memberProfileImage || '/images/BIDEO_LOGO/BIDEO_favicon.png'}" alt="${escapeHtml(comment.memberNickname || 'user')}">
      <div class="work-detail-comment-copy">
        <div class="work-detail-comment-body">
          <span class="work-detail-comment-name">${escapeHtml(comment.memberNickname || 'user')}</span>
          <span class="work-detail-comment-text">${escapeHtml(comment.content || '')}</span>
        </div>
        <div class="work-detail-comment-meta">
          <span>${formatWorkDate(comment.createdDatetime)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderWorkMedia(work) {
  const wrap = document.getElementById('workDetailMediaWrap');
  if (!wrap) return Promise.resolve();

  resetWorkDetailSheetSize();

  const file = work?.files?.[0];
  const mediaUrl = file?.fileUrl || work?.thumbnailUrl || '/images/BIDEO_LOGO/BIDEO_transparent_4x_nobg3.png';
  const fileType = file?.fileType || '';

  if (fileType.startsWith('video/') || work?.category === 'VIDEO') {
    wrap.innerHTML = `
      <video class="work-detail-media" src="${mediaUrl}" controls autoplay muted loop playsinline></video>
    `;
    const video = wrap.querySelector('video');
    return new Promise((resolve) => {
      video.addEventListener('loadedmetadata', () => {
        fitWorkDetailSheetToMedia(video.videoWidth, video.videoHeight);
        resolve();
      }, { once: true });
      video.addEventListener('error', () => resolve(), { once: true });
    });
  }

  wrap.innerHTML = `
    <img class="work-detail-media" src="${mediaUrl}" alt="작품 상세">
  `;
  const image = wrap.querySelector('img');
  return new Promise((resolve) => {
    image.addEventListener('load', () => {
      fitWorkDetailSheetToMedia(image.naturalWidth, image.naturalHeight);
      resolve();
    }, { once: true });
    image.addEventListener('error', () => resolve(), { once: true });
  });
}

async function renderWorkDetailModal(work) {
  currentWorkDetail = work;
  document.getElementById('workDetailAuthor').textContent = work.memberNickname || '작성자';
  document.getElementById('workDetailDate').textContent = formatWorkDate(work.createdDatetime);
  document.getElementById('workDetailTitle').textContent = work.title || '';
  document.getElementById('workDetailDescription').textContent = work.description || '';

  const priceEl = document.getElementById('workDetailPrice');
  const formattedPrice = formatWorkPrice(work.price);
  priceEl.textContent = formattedPrice;
  priceEl.style.display = formattedPrice ? 'block' : 'none';

  const tagsEl = document.getElementById('workDetailTags');
  const tags = (work.tags || []).map((tag) => `#${tag.tagName}`).join(' ');
  tagsEl.textContent = tags;
  tagsEl.style.display = tags ? 'block' : 'none';

  const statsEl = document.getElementById('workDetailStats');
  const likeCount = work.likeCount ?? 0;
  const viewCount = work.viewCount ?? 0;
  statsEl.textContent = `좋아요 ${likeCount} · 조회수 ${viewCount}`;

  const commentCountEl = document.getElementById('workDetailCommentCount');
  commentCountEl.textContent = `댓글 ${work.commentCount ?? 0}`;
  renderWorkComments(work.comments || []);

  const statusEl = document.getElementById('workDetailStatus');
  statusEl.textContent = work.status || 'ACTIVE';

  const licenseEl = document.getElementById('workDetailLicense');
  licenseEl.textContent = work.licenseType || 'LICENSE';

  await renderWorkMedia(work);
  closeModal('workActionModal');
  document.getElementById('workDetailModal').classList.add('active');
}

async function submitWorkComment() {
  if (!currentWorkDetail?.id) return;

  const input = document.getElementById('workDetailCommentInput');
  if (!input) return;

  const content = input.value.trim();
  if (!content) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }

  try {
    const response = await fetch(`/api/works/${currentWorkDetail.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetType: 'WORK',
        targetId: currentWorkDetail.id,
        content
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '댓글 등록에 실패했습니다.');
    }

    const updatedWork = await response.json();
    input.value = '';
    await renderWorkDetailModal(updatedWork);
  } catch (error) {
    alert(error.message || '댓글 등록에 실패했습니다.');
  }
}

async function openWorkDetailModal(workId) {
  try {
    const response = await fetch(`/api/works/${workId}`);
    if (!response.ok) {
      throw new Error('작품 정보를 불러오지 못했습니다.');
    }
    const work = await response.json();
    await renderWorkDetailModal(work);
  } catch (error) {
    alert(error.message || '작품 정보를 불러오지 못했습니다.');
  }
}

async function openSampleWorkModal(event) {
  event.preventDefault();
  await renderWorkDetailModal({
    memberNickname: 'bideo',
    createdDatetime: '2026-03-19T12:00:00',
    title: 'BIDEO 소개 영상',
    description: '댓글 없는 샘플 게시글입니다.',
    price: null,
    category: 'VIDEO',
    thumbnailUrl: '/images/main_vidios/BIDEO_introduce_video.mp4',
    likeCount: 0,
    viewCount: 0,
    tags: [{ tagName: 'bideo' }, { tagName: 'sample' }]
  });
}

// ─── 하이라이트 캔버스 링 ─────────────────────────
function drawRing(canvas, active) {
  const ctx = canvas.getContext('2d');
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  ctx.clearRect(0, 0, RING_SIZE, RING_SIZE);
  ctx.strokeStyle = active ? RING_ACTIVE : RING_GREY;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, RING_RADIUS, 0, Math.PI * 2);
  ctx.stroke();
}

// ─── 모달 유틸리티 ────────────────────────────────
function closeModal(id, e) {
  const modal = document.getElementById(id);
  if (!e || e.target === modal) {
    modal.classList.remove('active');
    if (id === 'workDetailModal') {
      resetWorkDetailSheetSize();
    }
  }
}

function openWorkActionModal(event) {
  event.stopPropagation();
  document.getElementById('workActionModal')?.classList.add('active');
}

async function editCurrentWork() {
  closeModal('workActionModal');
  if (!currentWorkDetail?.id) return;
  populateWorkEditModal(currentWorkDetail);
  document.getElementById('workEditModal')?.classList.add('active');
}

async function deleteCurrentWork() {
  closeModal('workActionModal');
  if (!currentWorkDetail?.id) return;
  if (!window.confirm('이 게시글을 삭제하시겠습니까?')) return;

  try {
    const response = await fetch(`/api/works/${currentWorkDetail.id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('게시글 삭제에 실패했습니다.');
    }

    closeModal('workDetailModal');
    window.location.reload();
  } catch (error) {
    alert(error.message || '게시글 삭제에 실패했습니다.');
  }
}

function renderWorkEditTags() {
  const tagBox = document.getElementById('workEditTagBox');
  const tagInput = document.getElementById('workEditTagInput');
  if (!tagBox || !tagInput) return;

  tagBox.querySelectorAll('.work-edit-modal__tag-item').forEach((element) => element.remove());

  workEditTags.forEach((tag, index) => {
    const tagItem = document.createElement('span');
    tagItem.className = 'work-edit-modal__tag-item';
    tagItem.innerHTML = `${tag}<button class="work-edit-modal__tag-remove" type="button" data-index="${index}">&times;</button>`;
    tagBox.insertBefore(tagItem, tagInput);
  });

  const label = tagBox.querySelector('label');
  if (label) {
    label.textContent = `태그된 주제 (${workEditTags.length}개)`;
  }
}

function addWorkEditTag(value) {
  const trimmed = value.trim();
  if (!trimmed) return;
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (workEditTags.includes(normalized)) return;
  workEditTags.push(normalized);
  renderWorkEditTags();
}

function removeWorkEditTag(index) {
  workEditTags.splice(index, 1);
  renderWorkEditTags();
}

function resetWorkEditMedia() {
  const previewVideo = document.getElementById('workEditPreviewVideo');
  const previewImage = document.getElementById('workEditPreviewImage');
  const placeholder = document.getElementById('workEditPlaceholder');
  const uploadArea = getWorkEditUploadArea();
  if (!previewVideo || !previewImage || !placeholder) return;

  previewVideo.pause();
  previewVideo.removeAttribute('src');
  previewVideo.load();
  previewVideo.style.display = 'none';
  previewImage.removeAttribute('src');
  previewImage.style.display = 'none';
  placeholder.style.display = 'block';
  uploadArea?.classList.remove('has-image');
}

function showWorkEditMediaFromUrl(url, category) {
  const previewVideo = document.getElementById('workEditPreviewVideo');
  const previewImage = document.getElementById('workEditPreviewImage');
  const placeholder = document.getElementById('workEditPlaceholder');
  const uploadArea = getWorkEditUploadArea();
  if (!previewVideo || !previewImage || !placeholder) return;

  placeholder.style.display = 'none';
  uploadArea?.classList.add('has-image');

  if (category === 'IMAGE') {
    previewVideo.pause();
    previewVideo.removeAttribute('src');
    previewVideo.load();
    previewVideo.style.display = 'none';
    previewImage.src = url;
    previewImage.style.display = 'block';
    return;
  }

  previewImage.removeAttribute('src');
  previewImage.style.display = 'none';
  previewVideo.src = url;
  previewVideo.style.display = 'block';
  previewVideo.controls = true;
  previewVideo.muted = true;
  previewVideo.loop = true;
  previewVideo.playsInline = true;
  previewVideo.load();
  previewVideo.play().catch(() => {});
}

function showWorkEditMediaFile(file, category) {
  if (category === 'IMAGE') {
    const reader = new FileReader();
    reader.onload = (event) => {
      showWorkEditMediaFromUrl(event.target?.result, 'IMAGE');
    };
    reader.readAsDataURL(file);
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  showWorkEditMediaFromUrl(objectUrl, category);
}

function populateWorkEditModal(work) {
  document.getElementById('workEditTitle').value = work.title || '';
  document.getElementById('workEditDescription').value = work.description || '';
  const workEditPrice = document.getElementById('workEditPrice');
  workEditPrice.dataset.storedValue = work.price ? Number(work.price).toLocaleString('ko-KR') : '';
  workEditPrice.value = '';
  document.getElementById('workEditTradeToggle').checked = false;
  document.getElementById('workEditAuctionToggle').checked = false;
  document.getElementById('workEditMoreToggle')?.classList.remove('open');
  document.getElementById('workEditMoreContent')?.classList.remove('visible');

  workEditTags = (work.tags || []).map((tag) => `#${tag.tagName}`);
  renderWorkEditTags();

  if (workEditGallerySelect) {
    workEditGallerySelect.value = work.galleryId ? String(work.galleryId) : '';
  }
  syncWorkEditGallerySelectUI();

  workEditSelectedFile = null;
  document.getElementById('workEditFileInput').value = '';

  const file = work.files?.[0];
  workEditExistingMediaUrl = file?.fileUrl || work.thumbnailUrl || null;

  if (workEditExistingMediaUrl) {
    showWorkEditMediaFromUrl(workEditExistingMediaUrl, work.category || 'VIDEO');
  } else {
    resetWorkEditMedia();
  }

  syncWorkEditPriceInput();
}

async function submitWorkEdit() {
  if (!currentWorkDetail?.id) return;

  const title = document.getElementById('workEditTitle').value.trim();
  const description = document.getElementById('workEditDescription').value.trim();
  const tradeEnabled = document.getElementById('workEditTradeToggle').checked;
  const rawPrice = document.getElementById('workEditPrice').value.replace(/,/g, '').trim();

  if (!title) {
    alert('제목을 입력해주세요.');
    return;
  }

  if (!workEditSelectedFile && !workEditExistingMediaUrl) {
    alert('사진 또는 영상을 먼저 업로드해주세요.');
    return;
  }

  if (!workEditGallerySelect?.value) {
    alert('예술관을 선택해주세요.');
    workEditGallerySelectTrigger?.focus();
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('category', currentWorkDetail.category || 'VIDEO');
  formData.append('description', description);
  if (rawPrice) {
    formData.append('price', Number(rawPrice));
  }
  formData.append('licenseType', currentWorkDetail.licenseType || 'PERSONAL');
  formData.append('licenseTerms', currentWorkDetail.licenseTerms || '');
  formData.append('isTradable', tradeEnabled);
  formData.append('allowComment', currentWorkDetail.allowComment ?? true);
  formData.append('showSimilar', currentWorkDetail.showSimilar ?? true);
  formData.append('linkUrl', currentWorkDetail.linkUrl || '');
  if (workEditGallerySelect?.value) {
    formData.append('galleryId', workEditGallerySelect.value);
  }
  workEditTags.forEach((tag) => formData.append('tagNames', tag));
  if (workEditSelectedFile) {
    formData.append('mediaFile', workEditSelectedFile);
  }

  try {
    const response = await fetch(`/api/works/${currentWorkDetail.id}/edit`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '게시글 수정에 실패했습니다.');
    }

    const updatedWork = await response.json();
    currentWorkDetail = updatedWork;
    closeModal('workEditModal');
    closeModal('workDetailModal');
    await openWorkDetailModal(updatedWork.id);
    window.location.reload();
  } catch (error) {
    alert(error.message || '게시글 수정에 실패했습니다.');
  }
}

function syncWorkEditPriceInput() {
  const workEditTradeToggle = document.getElementById('workEditTradeToggle');
  const workEditAuctionToggle = document.getElementById('workEditAuctionToggle');
  const workEditPrice = document.getElementById('workEditPrice');
  if (!workEditTradeToggle || !workEditPrice || !workEditAuctionToggle) return;

  const enabled = workEditTradeToggle.checked || workEditAuctionToggle.checked;
  workEditPrice.disabled = !enabled;
  workEditPrice.style.opacity = enabled ? '1' : '0.5';
  workEditPrice.style.cursor = enabled ? 'text' : 'not-allowed';
  if (enabled && !workEditPrice.value && workEditPrice.dataset.storedValue) {
    workEditPrice.value = workEditPrice.dataset.storedValue;
  }
  if (!enabled) {
    if (workEditPrice.value) {
      workEditPrice.dataset.storedValue = workEditPrice.value;
    }
    workEditPrice.value = '';
  }
}

function openWorkEditPostPreview({ title, description, tags, price, mediaType, mediaUrl }) {
  if (!workEditPreviewModal || !workEditPreviewMediaModal) {
    return;
  }

  workEditPreviewTitleModal.textContent = title || '제목 없음';
  workEditPreviewDescriptionModal.textContent = description || '설명이 없습니다.';
  workEditPreviewTagsModal.textContent = (tags || []).join(' ');
  workEditPreviewTagsModal.style.display = tags?.length ? 'block' : 'none';
  workEditPreviewPriceModal.textContent = price ? `${price}${price.includes('원') ? '' : '원'}` : '';
  workEditPreviewPriceModal.style.display = price ? 'block' : 'none';

  if (!mediaUrl || !mediaType) {
    workEditPreviewMediaModal.innerHTML = `
      <div class="work-edit-preview-empty">
        사진 또는 영상을 선택하면<br>이 위치에서 게시글 전체 미리보기가 보입니다.
      </div>
    `;
  } else if (mediaType === 'IMAGE') {
    workEditPreviewMediaModal.innerHTML = `<img src="${mediaUrl}" alt="게시글 미리보기">`;
  } else {
    workEditPreviewMediaModal.innerHTML = `<video src="${mediaUrl}" controls autoplay muted loop playsinline></video>`;
  }

  workEditPreviewModal.classList.add('active');
}

// ─── 탭 아이콘 ───────────────────────────────────
const TAB_ICONS = {
  grid: {
    active: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="17" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/><rect x="17" y="9" width="6" height="6"/><rect x="1" y="17" width="6" height="6"/><rect x="9" y="17" width="6" height="6"/><rect x="17" y="17" width="6" height="6"/></svg>',
    inactive: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 1H4a1 1 0 0 0-1 1v20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Zm-9.654 13.32V9.68h3.307v4.64h-3.307Zm3.307 2V21h-3.307v-4.68h3.307ZM5 9.68h3.346v4.64H5V9.68Zm5.346-2V3h3.307v4.68h-3.307Zm5.307 2H19v4.64h-3.347V9.68Zm3.347-2h-3.347V3H19v4.68ZM8.346 3v4.68H5V3h3.346ZM5 16.32h3.346V21H5v-4.68ZM15.653 21v-4.68H19V21h-3.347Z"/></svg>'
  },
  saved: {
    active: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 22a.999.999 0 0 1-.687-.273L12 14.815l-7.313 6.912A1 1 0 0 1 3 21V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1Z"/></svg>',
    inactive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>'
  }
};

function switchTab(e, clicked) {
  e.preventDefault();
  const tabs = document.querySelectorAll('.tab-item');
  tabs.forEach(tab => {
    const key = tab.dataset.tab;
    tab.classList.remove('active');
    tab.innerHTML = TAB_ICONS[key].inactive;
  });
  clicked.classList.add('active');
  clicked.innerHTML = TAB_ICONS[clicked.dataset.tab].active;

  // 비디오갤러리 연동
  const highlights = document.querySelectorAll('.video-gallery-li:not(:has(.plus-icon))');
  if (clicked.dataset.tab === 'saved') {
    highlights.forEach(li => {
      li.classList.remove('video-gallery-active');
      const c = li.querySelector('.ring-canvas');
      if (c) drawRing(c, false);
    });
  } else {
    const first = highlights[0];
    if (first) {
      first.classList.add('video-gallery-active');
      drawRing(first.querySelector('.ring-canvas'), true);
    }
  }
}

// ─── 팔로우·팔로잉 모달 (공통) ──────────────────
const followData = {
  followers: [
    { username: 'kim_photo', realname: '김민수', iFollow: true },
    { username: 'park_design', realname: '박서연' },
    { username: 'lee_travel', realname: '이하늘' },
    { username: 'choi_art', realname: '최예진' },
    { username: 'jung_music', realname: '정우성' }
  ],
  following: [
    { username: 'seoul_eats', realname: '서울맛집' },
    { username: 'daily_sketch', realname: '데일리스케치' },
    { username: 'cafe_hopper', realname: '카페탐방러' },
    { username: 'nature_lens', realname: '자연렌즈' }
  ]
};

let currentFollowTab = 'followers';

function openFollowModal() {
  closeModal('settingsModal');
  const modal = document.getElementById('followModal');
  modal.querySelector('.follow-modal__search-input').value = '';
  setFollowTab('followers');
  modal.classList.add('active');
}

function switchFollowTab(clicked) {
  setFollowTab(clicked.dataset.followTab);
}

function setFollowTab(tab) {
  currentFollowTab = tab;
  const tabs = document.querySelectorAll('.follow-modal__tab');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.followTab === tab));
  document.querySelector('.follow-modal__title').textContent = tab === 'followers' ? '팔로워' : '팔로잉';
  document.querySelector('.follow-modal__search-input').value = '';
  renderFollowList('');
}

function renderFollowList(filter) {
  const list = document.getElementById('followList');
  const data = followData[currentFollowTab] || [];
  const filtered = filter
    ? data.filter(u => u.username.includes(filter) || u.realname.includes(filter))
    : data;

  if (IS_OWNER) {
    const isFollowingTab = currentFollowTab === 'following';
    list.innerHTML = filtered.map(u => {
      const btnHtml = isFollowingTab
        ? `<button class="btn-secondary btn-secondary--sm btn-secondary--active" onclick="toggleFollowing(this)">팔로잉</button>`
        : u.iFollow
          ? ''
          : `<button class="btn-secondary btn-secondary--sm">팔로우</button>`;
      return `
      <div class="follow-user">
        <div class="follow-user__avatar"></div>
        <div class="follow-user__info">
          <div class="follow-user__name">${u.username}</div>
          <div class="follow-user__realname">${u.realname}</div>
        </div>
        ${btnHtml}
      </div>`;
    }).join('');
  } else {
    list.innerHTML = filtered.map(u => {
      const btnHtml = u.iFollow
        ? `<button class="btn-secondary btn-secondary--sm btn-secondary--active" onclick="toggleFollowing(this)">팔로잉</button>`
        : `<button class="btn-secondary btn-secondary--sm">팔로우</button>`;
      return `
      <div class="follow-user">
        <div class="follow-user__avatar"></div>
        <div class="follow-user__info">
          <div class="follow-user__name">${u.username}</div>
          <div class="follow-user__realname">${u.realname}</div>
        </div>
        ${btnHtml}
      </div>`;
    }).join('');
  }
}

function toggleFollowing(btn) {
  const isCancelled = btn.classList.toggle('btn-secondary--cancel');
  if (isCancelled) {
    btn.classList.remove('btn-secondary--active');
    btn.textContent = '팔로잉 취소';
  } else {
    btn.classList.add('btn-secondary--active');
    btn.classList.remove('btn-secondary--cancel');
    btn.textContent = '팔로잉';
  }
}

function filterFollowList(value) {
  renderFollowList(value.trim().toLowerCase());
}

function openFollowModalTab(e, tab) {
  e.preventDefault();
  const modal = document.getElementById('followModal');
  modal.querySelector('.follow-modal__search-input').value = '';
  setFollowTab(tab);
  modal.classList.add('active');
}

function openGalleryListModal() {
  if (!IS_OWNER) return;
  document.getElementById('galleryListModal')?.classList.add('active');
}

function openGalleryCloseupModal(trigger) {
  if (!trigger) return;

  const galleryId = Number(trigger.dataset.galleryId || 0);
  const title = trigger.dataset.galleryTitle || '예술관';
  const description = trigger.dataset.galleryDescription || '';
  const cover = trigger.dataset.galleryCover || '';
  const owner = trigger.dataset.galleryOwner || 'bideo';
  const workCount = Number(trigger.dataset.galleryWorkCount || 0);
  const likeCount = Number(trigger.dataset.galleryLikeCount || 0);
  const viewCount = Number(trigger.dataset.galleryViewCount || 0);

  const image = document.getElementById('galleryCloseupImage');
  const fallback = document.getElementById('galleryCloseupFallback');
  const titleElement = document.getElementById('galleryCloseupTitle');
  const ownerElement = document.getElementById('galleryCloseupOwner');
  const workCountElement = document.getElementById('galleryCloseupWorkCount');
  const likeCountElement = document.getElementById('galleryCloseupLikeCount');
  const viewCountElement = document.getElementById('galleryCloseupViewCount');
  const descriptionElement = document.getElementById('galleryCloseupDescription');
  const commentAuthorElement = document.getElementById('galleryCloseupCommentAuthor');
  const commentTextElement = document.getElementById('galleryCloseupCommentText');

  currentGalleryDetail = {
    id: galleryId,
    title,
    description,
    owner,
    workCount,
    likeCount,
    viewCount,
    cover
  };

  if (titleElement) titleElement.textContent = title;
  if (ownerElement) ownerElement.textContent = owner;
  if (workCountElement) workCountElement.textContent = workCount.toLocaleString('ko-KR');
  if (likeCountElement) likeCountElement.textContent = likeCount.toLocaleString('ko-KR');
  if (viewCountElement) viewCountElement.textContent = viewCount.toLocaleString('ko-KR');
  if (descriptionElement) {
    descriptionElement.textContent = description || `${owner}님의 예술관입니다. 작품 ${workCount.toLocaleString('ko-KR')}개, 좋아요 ${likeCount.toLocaleString('ko-KR')}개, 조회수 ${viewCount.toLocaleString('ko-KR')}회를 기록했습니다.`;
  }
  if (commentAuthorElement) commentAuthorElement.textContent = owner;
  if (commentTextElement) {
    commentTextElement.textContent = `${title} 예술관의 대표 반응을 확인해보세요.`;
  }

  if (image && fallback) {
    if (cover) {
      image.src = cover;
      image.style.display = 'block';
      fallback.style.display = 'none';
    } else {
      image.removeAttribute('src');
      image.style.display = 'none';
      fallback.textContent = title.length > 2 ? title.slice(0, 2) : title;
      fallback.style.display = 'flex';
    }
  }

  closeModal('galleryListModal');
  document.getElementById('galleryCloseupModal')?.classList.add('active');
}

function openGalleryActionModal(event) {
  event?.stopPropagation();
  document.getElementById('galleryActionModal')?.classList.add('active');
}

function editCurrentGallery() {
  closeModal('galleryActionModal');
  if (!currentGalleryDetail?.id) return;
  populateGalleryEditModal(currentGalleryDetail);
  document.getElementById('galleryEditModal')?.classList.add('active');
}

function getGalleryEditUploadArea() {
  return document.getElementById('galleryEditUploadArea');
}

function resetGalleryEditPreview() {
  const previewImage = document.getElementById('galleryEditPreviewImage');
  const placeholder = document.getElementById('galleryEditPlaceholder');
  const uploadArea = getGalleryEditUploadArea();
  if (!previewImage || !placeholder) return;

  previewImage.removeAttribute('src');
  previewImage.style.display = 'none';
  placeholder.style.display = 'block';
  uploadArea?.classList.remove('has-image');
}

function showGalleryEditPreviewFromUrl(url) {
  const previewImage = document.getElementById('galleryEditPreviewImage');
  const placeholder = document.getElementById('galleryEditPlaceholder');
  const uploadArea = getGalleryEditUploadArea();
  if (!previewImage || !placeholder) return;

  previewImage.src = url;
  previewImage.style.display = 'block';
  placeholder.style.display = 'none';
  uploadArea?.classList.add('has-image');
}

function showGalleryEditPreviewFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('사진 파일만 업로드할 수 있습니다.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    showGalleryEditPreviewFromUrl(event.target?.result);
  };
  reader.readAsDataURL(file);
}

function populateGalleryEditModal(gallery) {
  const titleInput = document.getElementById('galleryEditTitleInput');
  const descriptionInput = document.getElementById('galleryEditDescriptionInput');
  const fileInput = document.getElementById('galleryEditFileInput');

  if (titleInput) titleInput.value = gallery.title || '';
  if (descriptionInput) descriptionInput.value = gallery.description || '';
  if (fileInput) fileInput.value = '';

  galleryEditSelectedFile = null;
  galleryEditExistingCoverUrl = gallery.cover || null;

  if (galleryEditExistingCoverUrl) {
    showGalleryEditPreviewFromUrl(galleryEditExistingCoverUrl);
  } else {
    resetGalleryEditPreview();
  }
}

async function submitGalleryEdit() {
  if (!currentGalleryDetail?.id) return;

  const titleInput = document.getElementById('galleryEditTitleInput');
  const descriptionInput = document.getElementById('galleryEditDescriptionInput');
  const title = titleInput?.value.trim() || '';
  const description = descriptionInput?.value.trim() || '';

  if (!title) {
    alert('예술관 제목을 입력해주세요.');
    titleInput?.focus();
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  if (galleryEditSelectedFile) {
    formData.append('coverFile', galleryEditSelectedFile);
  }

  try {
    const response = await fetch(`/api/galleries/${currentGalleryDetail.id}/edit`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '예술관 수정에 실패했습니다.');
    }

    closeModal('galleryEditModal');
    closeModal('galleryCloseupModal');
    window.location.reload();
  } catch (error) {
    alert(error.message || '예술관 수정에 실패했습니다.');
  }
}

function deleteCurrentGallery() {
  closeModal('galleryActionModal');
  if (!currentGalleryDetail?.id) return;
  if (!window.confirm('이 예술관을 삭제하시겠습니까?')) return;

  fetch(`/api/galleries/${currentGalleryDetail.id}`, {
    method: 'DELETE'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('예술관 삭제에 실패했습니다.');
      }
      window.location.reload();
    })
    .catch((error) => {
      alert(error.message || '예술관 삭제에 실패했습니다.');
    });
}

// ─── Viewer 전용: 팔로우 토글 ─────────────────────
let isFollowing = false;

function toggleFollow() {
  const btn = document.getElementById('followBtn');
  isFollowing = !isFollowing;
  if (isFollowing) {
    btn.textContent = '팔로잉';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary', 'btn-secondary--active', 'is-following');
  } else {
    btn.textContent = '팔로우';
    btn.classList.remove('btn-secondary', 'btn-secondary--active', 'is-following');
    btn.classList.add('btn-primary');
  }
}

// ─── Owner 전용: 태그 관리 ────────────────────────
let editTags = [];

function renderEditTags() {
  const container = document.getElementById('editTagList');
  if (!container) return;
  container.innerHTML = editTags.map((tag, i) =>
    `<span class="edit-modal__tag-pill">
       ${tag}
       <button class="edit-modal__tag-pill__remove" onclick="removeEditTag(${i})">&times;</button>
     </span>`
  ).join('');
}

function addEditTag(value) {
  let tag = value.trim();
  if (!tag) return;
  if (!tag.startsWith('#')) tag = '#' + tag;
  if (!editTags.includes(tag)) {
    editTags.push(tag);
    renderEditTags();
  }
}

function removeEditTag(index) {
  editTags.splice(index, 1);
  renderEditTags();
}

// ─── Owner 전용: 프로필 편집 모달 ─────────────────
function openEditModal(e) {
  if (!IS_OWNER) return;
  e.preventDefault();
  document.getElementById('editUsername').value = document.querySelector('.profile-username').textContent;
  document.getElementById('editRealname').value = document.querySelector('.profile-realname').textContent;
  document.getElementById('editBio').value = document.querySelector('.profile-bio').textContent;
  editTags = Array.from(document.querySelectorAll('.profile-tag')).map(el => el.textContent.trim());
  renderEditTags();
  document.getElementById('editTagInput').value = '';
  document.getElementById('editModal').classList.add('active');
}

function saveProfile() {
  const username = document.getElementById('editUsername').value.trim();
  const realname = document.getElementById('editRealname').value.trim();
  const bio = document.getElementById('editBio').value.trim();
  if (username) document.querySelector('.profile-username').textContent = username;
  if (realname) document.querySelector('.profile-realname').textContent = realname;
  document.querySelector('.profile-tags').innerHTML = editTags.map(t =>
    `<span class="profile-tag">${t}</span>`
  ).join('');
  document.querySelector('.profile-bio').textContent = bio;
  closeModal('editModal');
}

// ─── Owner 전용: 아바타 모달 ──────────────────────
function openAvatarModal() {
  if (!IS_OWNER) return;
  const modal = document.getElementById('avatarModal');
  const avatarImg = document.querySelector('.profile-avatar img');
  const previewImg = modal.querySelector('.avatar-modal__preview-img');
  previewImg.src = avatarImg ? avatarImg.src : '';
  modal.classList.add('active');
}

// ─── Owner 전용: 설정 허브 모달 ───────────────────
function openSettingsModal() {
  if (!IS_OWNER) return;
  document.getElementById('settingsModal').classList.add('active');
}

function openAvatarFromSettings() {
  closeModal('settingsModal');
  openAvatarModal();
}

// ─── Owner 전용: 닉네임 변경 모달 ─────────────────
function openNicknameModal() {
  closeModal('settingsModal');
  document.getElementById('nicknameInput').value = document.querySelector('.profile-username').textContent;
  document.getElementById('nicknameModal').classList.add('active');
}

function saveNickname() {
  const value = document.getElementById('nicknameInput').value.trim();
  if (value) {
    document.querySelector('.profile-username').textContent = value;
  }
  closeModal('nicknameModal');
}

// ─── Owner 전용: 패스워드 변경 모달 ───────────────
function openPasswordModal() {
  closeModal('settingsModal');
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  document.getElementById('passwordError').textContent = '';
  document.getElementById('passwordModal').classList.add('active');
}

function savePassword() {
  const current = document.getElementById('currentPassword').value;
  const newPw = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;
  const errorEl = document.getElementById('passwordError');

  if (!current || !newPw || !confirm) {
    errorEl.textContent = '모든 필드를 입력해주세요.';
    return;
  }
  if (newPw.length < 6) {
    errorEl.textContent = '새 비밀번호는 6자 이상이어야 합니다.';
    return;
  }
  if (newPw !== confirm) {
    errorEl.textContent = '새 비밀번호가 일치하지 않습니다.';
    return;
  }
  errorEl.textContent = '';
  closeModal('passwordModal');
}

// ─── Owner 전용: 뱃지 관리 ────────────────────────
const BADGES = [
  { id: 'first_video',    name: '첫 영상 업로드',  grade: 'bronze', img: '../../static/images/badge/first_video_badge.png',                    owned: true },
  { id: 'write_contest',  name: '공모전 참가',     grade: 'bronze', img: '../../static/images/badge/write_contest_badge.png',                  owned: true },
  { id: 'first_sell',     name: '첫 판매',         grade: 'bronze', img: '../../static/images/badge/first_sell_badge.png',                      owned: false },
  { id: 'upload_5',       name: '5회 이상 업로드',  grade: 'silver', img: '../../static/images/badge/uploaded_more_than_5_times_badge.png',      owned: true },
  { id: 'first_auction',  name: '첫 경매 낙찰',    grade: 'silver', img: '../../static/images/badge/first_auction_winner_badge.png',            owned: false },
  { id: 'contest_award',  name: '공모전 수상',     grade: 'gold',   img: '../../static/images/badge/contest_award_badge.png',                  owned: false },
  { id: 'auction_1m',     name: '낙찰가 100만원',  grade: 'gold',   img: '../../static/images/badge/auction_price_of_1_million_won_badge.png',  owned: false },
  { id: 'auction_10m',    name: '낙찰가 1000만원', grade: 'black',  img: '../../static/images/badge/auction_price_of_10_million_won_badge.png', owned: false },
  { id: 'gallery_views',  name: '조회 1000만',     grade: 'black',  img: '../../static/images/badge/art_gallery_views_over_10_million.png',     owned: false },
];

let selectedBadges = ['first_video', 'upload_5'];
const GRADE_LABELS = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', black: 'Black' };

function openBadgeModal() {
  closeModal('settingsModal');
  renderBadgeGrid();
  document.getElementById('badgeModal').classList.add('active');
}

function renderBadgeGrid() {
  const grid = document.getElementById('badgeGrid');
  if (!grid) return;
  let lastGrade = '';
  let html = '';
  BADGES.forEach(b => {
    if (b.grade !== lastGrade) {
      lastGrade = b.grade;
      html += `<div class="badge-grade-divider badge-grade-divider--${b.grade}"><span>${GRADE_LABELS[b.grade]}</span></div>`;
    }
    const locked = !b.owned;
    const selected = selectedBadges.includes(b.id);
    const cls = ['badge-item', `badge-item--${b.grade}`];
    if (locked) cls.push('badge-item--locked');
    if (selected) cls.push('badge-item--selected');
    html += `
      <div class="${cls.join(' ')}" onclick="toggleBadge('${b.id}')">
        <div class="badge-item__icon"><img src="${b.img}" alt="${b.name}"></div>
        <span class="badge-item__name">${b.name}</span>
      </div>`;
  });
  grid.innerHTML = html;
}

function toggleBadge(id) {
  const badge = BADGES.find(b => b.id === id);
  if (!badge || !badge.owned) return;
  const idx = selectedBadges.indexOf(id);
  if (idx !== -1) {
    selectedBadges.splice(idx, 1);
  } else if (selectedBadges.length < 2) {
    selectedBadges.push(id);
  }
  renderBadgeGrid();
}

function saveBadges() {
  renderProfileBadges();
  closeModal('badgeModal');
}

function renderProfileBadges() {
  const container = document.getElementById('profileBadges');
  if (!container) return;
  container.innerHTML = selectedBadges.map(id => {
    const b = BADGES.find(x => x.id === id);
    if (!b) return '';
    return `<span class="profile-badge"><img src="${b.img}" alt="${b.name}"></span>`;
  }).join('');
}

// ─── DOMContentLoaded (통합) ─────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initializeWorkEditGallerySelect();
  // 하이라이트 링 렌더링
  const highlights = document.querySelectorAll('.video-gallery-li');
  highlights.forEach(li => {
    const canvas = li.querySelector('.ring-canvas');
    if (!canvas) return;
    const isActive = canvas.dataset.ring === 'gradient';
    if (isActive) li.classList.add('video-gallery-active');
    drawRing(canvas, isActive);
  });

  // 하이라이트 클릭 전환 (신규 버튼 제외)
  highlights.forEach(li => {
    const btn = li.querySelector('.video-gallery-button');
    if (li.querySelector('.plus-icon')) return;
    btn.addEventListener('click', () => {
      if (li.classList.contains('video-gallery-active')) return;
      highlights.forEach(other => {
        other.classList.remove('video-gallery-active');
        const c = other.querySelector('.ring-canvas');
        if (c) drawRing(c, false);
      });
      li.classList.add('video-gallery-active');
      drawRing(li.querySelector('.ring-canvas'), true);

      // saved 탭이 활성화되어 있으면 grid 탭으로 전환
      const savedTab = document.querySelector('.tab-item[data-tab="saved"]');
      if (savedTab && savedTab.classList.contains('active')) {
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach(tab => {
          const key = tab.dataset.tab;
          tab.classList.remove('active');
          tab.innerHTML = TAB_ICONS[key].inactive;
        });
        const gridTab = document.querySelector('.tab-item[data-tab="grid"]');
        if (gridTab) {
          gridTab.classList.add('active');
          gridTab.innerHTML = TAB_ICONS.grid.active;
        }
      }
    });
  });

  if (IS_OWNER) {
    // 아바타 클릭 → 모달
    const avatar = document.getElementById('profileAvatar');
    if (avatar) avatar.addEventListener('click', openAvatarModal);

    // 아바타 파일 업로드
    const fileInput = document.getElementById('avatarFileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target.result;
          const avatarDiv = document.querySelector('.profile-avatar');
          let avatarImg = avatarDiv.querySelector('img');
          if (!avatarImg) {
            const cameraIcon = avatarDiv.querySelector('.camera-icon');
            if (cameraIcon) cameraIcon.style.display = 'none';
            avatarImg = document.createElement('img');
            avatarImg.style.width = '100%';
            avatarImg.style.height = '100%';
            avatarImg.style.objectFit = 'cover';
            avatarImg.style.borderRadius = '50%';
            avatarImg.alt = '프로필 사진';
            avatarDiv.appendChild(avatarImg);
          }
          avatarImg.src = dataUrl;
          const previewImg = document.querySelector('.avatar-modal__preview-img');
          if (previewImg) previewImg.src = dataUrl;
          closeModal('avatarModal');
        };
        reader.readAsDataURL(file);
        fileInput.value = '';
      });
    }

    // 태그 입력 이벤트
    const tagInput = document.getElementById('editTagInput');
    if (tagInput) {
      tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addEditTag(tagInput.value);
          tagInput.value = '';
        }
      });
      const tagWrap = document.querySelector('.edit-modal__tag-input-wrap');
      if (tagWrap) tagWrap.addEventListener('click', () => tagInput.focus());
    }

    // 뱃지 초기 렌더
    renderProfileBadges();
  } else {
    // Viewer: 팔로우 버튼 hover
    const followBtn = document.getElementById('followBtn');
    if (followBtn) {
      followBtn.addEventListener('mouseenter', () => {
        if (isFollowing) followBtn.textContent = '언팔로우';
      });
      followBtn.addEventListener('mouseleave', () => {
        if (isFollowing) followBtn.textContent = '팔로잉';
      });
    }
  }

  const workEditUploadArea = document.getElementById('workEditUploadArea');
  const workEditFileInput = document.getElementById('workEditFileInput');
  const workEditTagInput = document.getElementById('workEditTagInput');
  const workEditTagBox = document.getElementById('workEditTagBox');
  const workEditTradeToggle = document.getElementById('workEditTradeToggle');
  const workEditAuctionToggle = document.getElementById('workEditAuctionToggle');
  const workEditPrice = document.getElementById('workEditPrice');
  const workEditPreviewButton = document.getElementById('workEditPreviewButton');
  const workEditMoreToggle = document.getElementById('workEditMoreToggle');
  const workEditMoreContent = document.getElementById('workEditMoreContent');
  const workDetailCommentInput = document.getElementById('workDetailCommentInput');
  const workDetailCommentSubmit = document.getElementById('workDetailCommentSubmit');
  const galleryEditUploadArea = document.getElementById('galleryEditUploadArea');
  const galleryEditFileInput = document.getElementById('galleryEditFileInput');

  if (workEditUploadArea && workEditFileInput) {
    workEditUploadArea.addEventListener('click', (event) => {
      if (event.target.closest('.save-from-url') || event.target.closest('.publish-btn')) {
        return;
      }
      workEditFileInput.click();
    });

    workEditUploadArea.addEventListener('dragover', (event) => {
      event.preventDefault();
      workEditUploadArea.classList.add('dragover');
    });

    workEditUploadArea.addEventListener('dragleave', () => {
      workEditUploadArea.classList.remove('dragover');
    });

    workEditUploadArea.addEventListener('drop', (event) => {
      event.preventDefault();
      workEditUploadArea.classList.remove('dragover');
      const file = event.dataTransfer.files[0];
      if (!file) return;
      workEditFileInput.files = event.dataTransfer.files;
      workEditFileInput.dispatchEvent(new Event('change'));
    });

    workEditFileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
        alert('영상 또는 이미지 파일만 업로드할 수 있습니다.');
        return;
      }

      workEditSelectedFile = file;
      workEditExistingMediaUrl = null;
      currentWorkDetail.category = file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';
      showWorkEditMediaFile(file, currentWorkDetail.category);
    });
  }

  if (workEditPreviewButton) {
    workEditPreviewButton.addEventListener('click', (event) => {
      event.preventDefault();
      const previewMediaUrl = workEditSelectedFile
        ? URL.createObjectURL(workEditSelectedFile)
        : workEditExistingMediaUrl;

      openWorkEditPostPreview({
        title: document.getElementById('workEditTitle').value.trim(),
        description: document.getElementById('workEditDescription').value.trim(),
        tags: workEditTags,
        price: workEditPrice?.value.trim(),
        mediaType: currentWorkDetail?.category || 'VIDEO',
        mediaUrl: previewMediaUrl
      });
    });
  }

  if (workEditTagInput) {
    workEditTagInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addWorkEditTag(workEditTagInput.value);
        workEditTagInput.value = '';
      }

      if (event.key === 'Backspace' && !workEditTagInput.value && workEditTags.length) {
        removeWorkEditTag(workEditTags.length - 1);
      }
    });
  }

  if (workEditTagBox) {
    workEditTagBox.addEventListener('click', (event) => {
      if (event.target.classList.contains('work-edit-modal__tag-remove')) {
        removeWorkEditTag(Number(event.target.dataset.index));
        return;
      }
      workEditTagInput?.focus();
    });
  }

  if (workEditTradeToggle && workEditPrice) {
    workEditTradeToggle.addEventListener('change', () => {
      if (workEditTradeToggle.checked && workEditAuctionToggle) {
        workEditAuctionToggle.checked = false;
      }
      syncWorkEditPriceInput();
    });

    workEditAuctionToggle?.addEventListener('change', () => {
      if (workEditAuctionToggle.checked && workEditTradeToggle) {
        workEditTradeToggle.checked = false;
      }
      syncWorkEditPriceInput();
    });
    workEditPrice.addEventListener('input', (event) => {
      const digitsOnly = event.target.value.replace(/,/g, '').replace(/\D/g, '');
      event.target.value = digitsOnly ? Number(digitsOnly).toLocaleString('ko-KR') : '';
    });
    syncWorkEditPriceInput();
  }

  workEditMoreToggle?.addEventListener('click', () => {
    workEditMoreToggle.classList.toggle('open');
    workEditMoreContent?.classList.toggle('visible');
  });

  workDetailCommentSubmit?.addEventListener('click', submitWorkComment);
  workDetailCommentInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitWorkComment();
    }
  });

  if (galleryEditUploadArea && galleryEditFileInput) {
    galleryEditUploadArea.addEventListener('click', () => {
      galleryEditFileInput.click();
    });

    galleryEditUploadArea.addEventListener('dragover', (event) => {
      event.preventDefault();
      galleryEditUploadArea.classList.add('dragover');
    });

    galleryEditUploadArea.addEventListener('dragleave', () => {
      galleryEditUploadArea.classList.remove('dragover');
    });

    galleryEditUploadArea.addEventListener('drop', (event) => {
      event.preventDefault();
      galleryEditUploadArea.classList.remove('dragover');
      const file = event.dataTransfer.files[0];
      if (!file) return;
      galleryEditFileInput.files = event.dataTransfer.files;
      galleryEditFileInput.dispatchEvent(new Event('change'));
    });

    galleryEditFileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) {
        if (galleryEditExistingCoverUrl) {
          showGalleryEditPreviewFromUrl(galleryEditExistingCoverUrl);
        } else {
          resetGalleryEditPreview();
        }
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('사진 파일만 업로드할 수 있습니다.');
        galleryEditFileInput.value = '';
        return;
      }

      galleryEditSelectedFile = file;
      showGalleryEditPreviewFile(file);
    });
  }
});

// ─── ESC 키 핸들러 (통합) ─────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  const upperModals = ['badgeModal', 'nicknameModal', 'followModal', 'passwordModal', 'workDetailModal', 'galleryListModal', 'galleryCloseupModal', 'galleryActionModal', 'galleryEditModal'];
  for (const id of upperModals) {
    const el = document.getElementById(id);
    if (el && el.classList.contains('active')) {
      el.classList.remove('active');
      return;
    }
  }

  const baseModals = ['settingsModal', 'editModal', 'avatarModal'];
  for (const id of baseModals) {
    const el = document.getElementById(id);
    if (el && el.classList.contains('active')) {
      el.classList.remove('active');
      return;
    }
  }
});
