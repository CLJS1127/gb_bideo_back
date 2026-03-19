// ─── 상수 & 전역 ─────────────────────────────────
const IS_OWNER = document.body.dataset.owner === 'true';
const RING_SIZE = 87;
const RING_RADIUS = 40.5;
const RING_ACTIVE = '#c4a84d';
const RING_GREY = 'rgb(219, 223, 228)';

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
  }
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
});

// ─── ESC 키 핸들러 (통합) ─────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  const upperModals = ['badgeModal', 'nicknameModal', 'followModal', 'passwordModal'];
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