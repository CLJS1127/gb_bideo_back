// ─── 공유 유틸리티 (main.js, closeup.js에서도 사용) ──────
const LOCAL_PROFILE_IMAGE = '/images/BIDEO_LOGO/BIDEO_favicon.png';

const placeholderPalettes = [
  ['#0f172a', '#1d4ed8', '#f59e0b'],
  ['#111827', '#7c3aed', '#f97316'],
  ['#1f2937', '#059669', '#facc15'],
  ['#172033', '#2563eb', '#fb7185'],
  ['#101826', '#0ea5e9', '#f8fafc']
];

function encodeSvg(svg) {
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function createAvatarDataUri(name, index) {
  const initial = (name || 'B').trim().charAt(0).toUpperCase();
  const palette = placeholderPalettes[index % placeholderPalettes.length];
  return encodeSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">' +
      '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="' + palette[0] + '"/>' +
      '<stop offset="55%" stop-color="' + palette[1] + '"/>' +
      '<stop offset="100%" stop-color="' + palette[2] + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="120" height="120" rx="60" fill="url(#g)"/>' +
      '<text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="48" font-weight="700">' + initial + '</text>' +
      '</svg>'
  );
}

function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = 'position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:2000;pointer-events:none';
    const inner = document.createElement('div');
    inner.style.cssText = 'background:#111;color:#fff;border-radius:16px;padding:16px 24px;font-size:14px;font-family:var(--font-sans);white-space:nowrap;pointer-events:auto;transform:translateY(0);transition:.7s cubic-bezier(.19,1.15,.48,1);visibility:visible';
    inner.setAttribute('role', 'status');
    inner.setAttribute('aria-live', 'polite');
    inner.textContent = message;
    toast.appendChild(inner);
    document.body.appendChild(toast);
    setTimeout(function () {
      inner.style.transform = 'translateY(100px)';
      inner.style.visibility = 'hidden';
      setTimeout(function () {
        toast.remove();
      }, 700);
    }, 3000);
  }

  function showEmailInviteModal() {
    const existing = document.querySelector('.email-invite-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'email-invite-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:3000;display:flex;align-items:center;justify-content:center';

    const modal = document.createElement('div');
    modal.style.cssText = 'background:#fff;border-radius:16px;padding:32px;width:400px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,.2);font-family:var(--font-sans)';
    modal.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">' +
        '<h2 style="margin:0;font-size:20px;font-weight:700;color:#111">이메일로 초대</h2>' +
        '<button class="email-modal-close" style="background:none;border:none;cursor:pointer;padding:4px">' +
        '<svg height="20" viewBox="0 0 24 24" width="20"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg>' +
        '</button>' +
        '</div>' +
        '<label style="display:block;font-size:14px;color:var(--text-sub);margin-bottom:8px">이메일 주소</label>' +
        '<input type="email" class="email-invite-input" placeholder="example@email.com" style="width:100%;box-sizing:border-box;padding:12px 16px;border:1px solid var(--border-color);border-radius:var(--border-radius);font-size:14px;font-family:var(--font-sans);outline:none">' +
        '<button class="email-invite-submit" disabled style="width:100%;margin-top:16px;padding:12px;border:none;border-radius:var(--border-radius);font-size:14px;font-weight:600;font-family:var(--font-sans);cursor:default;background:#e4e4e4;color:#999;transition:all .2s">' +
        '초대하기' +
        '</button>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const input = modal.querySelector('.email-invite-input');
    const submitBtn = modal.querySelector('.email-invite-submit');
    const closeBtn = modal.querySelector('.email-modal-close');

    input.focus();

    // 이메일 유효성 → 버튼 활성화
    input.addEventListener('input', function () {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value.trim());
      if (valid) {
        submitBtn.disabled = false;
        submitBtn.style.background = 'var(--primary-color)';
        submitBtn.style.color = '#111';
        submitBtn.style.cursor = 'pointer';
      } else {
        submitBtn.disabled = true;
        submitBtn.style.background = '#e4e4e4';
        submitBtn.style.color = '#999';
        submitBtn.style.cursor = 'default';
      }
    });

    // focus 스타일
    input.addEventListener('focus', function () {
      this.style.borderColor = '#111';
    });
    input.addEventListener('blur', function () {
      this.style.borderColor = 'var(--border-color)';
    });

    // 초대하기 클릭
    submitBtn.addEventListener('click', function () {
      if (this.disabled) return;
      overlay.remove();
      showToast('초대가 완료되었습니다');
    });

    // 닫기
    closeBtn.addEventListener('click', function () {
      overlay.remove();
    });
    overlay.addEventListener('click', function (ev) {
      if (ev.target === overlay) overlay.remove();
    });
  }

window.addEventListener('load', () => {
  // ─── 네비 메뉴 닫기 ──────────────────────────────
  function closeAllMenus() {
    const accountDD = document.getElementById('account-dropdown');
    if (accountDD) accountDD.remove();
    removeAllSidePanels();
    document.querySelectorAll('.context-menu').forEach(function(m) { m.remove(); });
  }

  // ─── 사이드 네비 툴팁 ──────────────────────────────
  function initNavTooltips() {
    const nav = document.getElementById('VerticalNavContent');
    if (!nav) return;

    let activeTooltip = null;
    const buttons = nav.querySelectorAll('a[aria-label], button[aria-label]');
    const mobileTooltipQuery = window.matchMedia('(max-width: 850px)');

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function positionTooltip(btn, tooltip) {
      const rect = btn.getBoundingClientRect();
      const gap = 12;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const isResponsiveNav = mobileTooltipQuery.matches;

      if (isResponsiveNav) {
        tooltip.classList.add('nav-tooltip--above');
        const centeredLeft = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
        const maxLeft = Math.max(8, viewportWidth - tooltip.offsetWidth - 8);
        const left = clamp(centeredLeft, 8, maxLeft);
        const top = Math.max(8, rect.top - tooltip.offsetHeight - gap);
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        return;
      }

      tooltip.classList.remove('nav-tooltip--above');
      const centeredTop = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
      const maxTop = Math.max(8, viewportHeight - tooltip.offsetHeight - 8);
      const top = clamp(centeredTop, 8, maxTop);
      const left = rect.right + gap;
      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
    }

    buttons.forEach(function (btn) {
      const label = btn.getAttribute('aria-label');
      if (!label) return;

      btn.addEventListener('mouseenter', function () {
        if (activeTooltip) activeTooltip.remove();
        const tooltip = document.createElement('div');
        tooltip.className = 'nav-tooltip';
        tooltip.textContent = label;
        document.body.appendChild(tooltip);
        positionTooltip(btn, tooltip);
        activeTooltip = tooltip;
      });

      btn.addEventListener('mouseleave', function () {
        if (activeTooltip) {
          activeTooltip.remove();
          activeTooltip = null;
        }
      });
    });
  }

  // ─── 네비 아이콘 맵 (전역) ──────────────────────────
  const navIconMap = {
    '홈': {
      default: 'M4.6 22.73A107 107 0 0 0 11 23h2.22c2.43-.04 4.6-.16 6.18-.27A3.9 3.9 0 0 0 23 18.8v-8.46a4 4 0 0 0-1.34-3L14.4.93a3.63 3.63 0 0 0-4.82 0L2.34 7.36A4 4 0 0 0 1 10.35v8.46a3.9 3.9 0 0 0 3.6 3.92M13.08 2.4l7.25 6.44a2 2 0 0 1 .67 1.5v8.46a1.9 1.9 0 0 1-1.74 1.92q-1.39.11-3.26.19V16a4 4 0 0 0-8 0v4.92q-1.87-.08-3.26-.19A1.9 1.9 0 0 1 3 18.81v-8.46a2 2 0 0 1 .67-1.5l7.25-6.44a1.63 1.63 0 0 1 2.16 0M13.12 21h-2.24a1 1 0 0 1-.88-1v-4a2 2 0 1 1 4 0v4a1 1 0 0 1-.88 1',
      active: 'M9.59.92a3.63 3.63 0 0 1 4.82 0l7.25 6.44A4 4 0 0 1 23 10.35v8.46a3.9 3.9 0 0 1-3.6 3.92 106 106 0 0 1-14.8 0A3.9 3.9 0 0 1 1 18.8v-8.46a4 4 0 0 1 1.34-3zM12 16a5 5 0 0 1-3.05-1.04l-1.23 1.58a7 7 0 0 0 8.56 0l-1.23-1.58A5 5 0 0 1 12 16'
    },
    '공모전': {
      default: 'M23 5a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4zm-10 6V3h6a2 2 0 0 1 2 2v6zm8 8a2 2 0 0 1-2 2h-6v-8h8zM5 3h6v18H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2',
      active: 'M11 23H5a4 4 0 0 1-4-4V5a4 4 0 0 1 4-4h6zm12-4a4 4 0 0 1-4 4h-6V13h10zM19 1a4 4 0 0 1 4 4v6H13V1z'
    },
    '만들기': {
      default: 'M11 11H6v2h5v5h2v-5h5v-2h-5V6h-2zM5 1a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4zm16 4v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2',
      active: 'M1 5a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4zm10 6H6v2h5v5h2v-5h5v-2h-5V6h-2z'
    },
    '알림': {
      default: 'M16 19h8v-2h-.34a3.15 3.15 0 0 1-3.12-2.76l-.8-6.41a7.8 7.8 0 0 0-15.48 0l-.8 6.41A3.15 3.15 0 0 1 .34 17H0v2h8v1h.02a3.4 3.4 0 0 0 3.38 3h1.2a3.4 3.4 0 0 0 3.38-3H16zm1.75-10.92.8 6.4c.12.95.5 1.81 1.04 2.52H4.4c.55-.7.92-1.57 1.04-2.51l.8-6.41a5.8 5.8 0 0 1 11.5 0M13.4 19c.33 0 .6.27.6.6 0 .77-.63 1.4-1.4 1.4h-1.2a1.4 1.4 0 0 1-1.4-1.4c0-.33.27-.6.6-.6z',
      active: 'M20.54 14.24A3.15 3.15 0 0 0 23.66 17H24v2h-8v1h-.02a3.4 3.4 0 0 1-3.38 3h-1.2a3.4 3.4 0 0 1-3.38-3H8v-1H0v-2h.34a3.15 3.15 0 0 0 3.12-2.76l.8-6.41a7.8 7.8 0 0 1 15.48 0zM10 19.6c0 .77.63 1.4 1.4 1.4h1.2c.77 0 1.4-.63 1.4-1.4a.6.6 0 0 0-.6-.6h-2.8a.6.6 0 0 0-.6.6'
    },
    '메시지': {
      default: 'M7 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m-5 10c1.8 0 3.5-.41 5-1.15l3.69.65A2 2 0 0 0 23 20.7l-.65-3.7A11.5 11.5 0 1 0 12 23.5m8.55-7.36-.28.58.76 4.31-4.31-.76-.58.28q-1.89.93-4.14.95a9.5 9.5 0 1 1 8.55-5.36',
      active: 'M17 22.35A11.5 11.5 0 1 1 22.36 17l.64 3.7a2 2 0 0 1-2.3 2.3zM7 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m5-3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3'
    },
    '대시보드': {
      default: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10m3 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m1.13-10.29A2 2 0 0 0 14.7.31a12 12 0 0 0-5.4 0c-.73.17-1.26.74-1.43 1.4l-.58 2.14-2.14-.57a2 2 0 0 0-1.93.54 12 12 0 0 0-2.7 4.67c-.22.72.01 1.46.5 1.95L2.59 12l-1.57 1.56a2 2 0 0 0-.5 1.95 12 12 0 0 0 2.7 4.68c.51.54 1.27.72 1.93.54l2.14-.58.58 2.14c.17.67.7 1.24 1.43 1.4a12 12 0 0 0 5.4 0 2 2 0 0 0 1.43-1.4l.58-2.14 2.13.58c.67.18 1.43 0 1.94-.55a12 12 0 0 0 2.7-4.67 2 2 0 0 0-.5-1.94L21.4 12l1.57-1.56c.49-.5.71-1.23.5-1.95a12 12 0 0 0-2.7-4.67 2 2 0 0 0-1.93-.54l-2.14.57zm-6.34.54a10 10 0 0 1 4.42 0l.56 2.12a2 2 0 0 0 2.45 1.41l2.13-.57a10 10 0 0 1 2.2 3.83L20 10.59a2 2 0 0 0 0 2.83l1.55 1.55a10 10 0 0 1-2.2 3.82l-2.13-.57a2 2 0 0 0-2.44 1.42l-.57 2.12a10 10 0 0 1-4.42 0l-.57-2.12a2 2 0 0 0-2.45-1.42l-2.12.57a10 10 0 0 1-2.2-3.82L4 13.42a2 2 0 0 0 0-2.83L2.45 9.03a10 10 0 0 1 2.2-3.82l2.13.57a2 2 0 0 0 2.44-1.41z',
      active: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M14.7.3c.73.18 1.25.74 1.43 1.41l.58 2.14 2.14-.57a2 2 0 0 1 1.93.54 12 12 0 0 1 2.7 4.67c.21.72-.01 1.46-.5 1.95L21.4 12l1.57 1.57c.49.49.72 1.23.5 1.94a12 12 0 0 1-2.7 4.67c-.51.55-1.27.73-1.94.55l-2.13-.58-.58 2.14a1.9 1.9 0 0 1-1.43 1.4 12 12 0 0 1-5.4 0 2 2 0 0 1-1.43-1.4l-.58-2.14-2.14.58c-.66.18-1.42 0-1.93-.54a12 12 0 0 1-2.7-4.68c-.22-.72.01-1.46.5-1.95L2.6 12l-1.57-1.56a2 2 0 0 1-.5-1.95 12 12 0 0 1 2.7-4.67 2 2 0 0 1 1.93-.54l2.14.57.58-2.14c.17-.66.7-1.23 1.43-1.4a12 12 0 0 1 5.4 0M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10'
    }
  };

  // ─── 모든 네비 아이콘 리셋 헬퍼 ──────────────────────
  function resetAllNavIcons() {
    const nav = document.getElementById('VerticalNavContent');
    if (!nav) return;
    const navBtns = nav.querySelectorAll('a[aria-label], button[aria-label]');
    navBtns.forEach(function (btn) {
      const label = btn.getAttribute('aria-label');
      if (navIconMap[label]) {
        const p = btn.querySelector('svg path');
        if (p) p.setAttribute('d', navIconMap[label].default);
      }
    });
    setCurrentNavIconActive();
  }

  function setCurrentNavIconActive() {
    const nav = document.getElementById('VerticalNavContent');
    if (!nav) return;

    let activeLabel = '홈';
    const pathname = window.location.pathname;
    if (pathname.indexOf('/contest') === 0) activeLabel = '공모전';

    const targetBtn = Array.from(nav.querySelectorAll('a[aria-label], button[aria-label]')).find(function (btn) {
      return btn.getAttribute('aria-label') === activeLabel && btn.querySelector('svg path');
    });

    if (!targetBtn) return;

    const path = targetBtn.querySelector('svg path');
    if (path && navIconMap[activeLabel]) path.setAttribute('d', navIconMap[activeLabel].active);
  }

  // ─── 모든 사이드 패널 제거 헬퍼 ──────────────────────
  function removeAllSidePanels() {
    ['create-menu', 'update-menu', 'message-menu', 'settings-menu'].forEach(function (id) {
      const menu = document.getElementById(id);
      if (menu) menu.remove();
    });
  }

  // ─── 사이드 네비 아이콘 토글 ──────────────────────────
  function initNavIconToggle() {
    const nav = document.getElementById('VerticalNavContent');
    if (!nav) return;

    const navBtns = nav.querySelectorAll('a[aria-label], button[aria-label]');

    navBtns.forEach(function (btn) {
      const label = btn.getAttribute('aria-label');
      if (!navIconMap[label]) return;

      btn.addEventListener('click', function (e) {
        const path = btn.querySelector('svg path');
        const isActive = path && path.getAttribute('d') === navIconMap[label].active;
        // 모든 아이콘을 기본 상태로 복원
        navBtns.forEach(function (other) {
          const otherLabel = other.getAttribute('aria-label');
          if (navIconMap[otherLabel]) {
            const otherPath = other.querySelector('svg path');
            if (otherPath) otherPath.setAttribute('d', navIconMap[otherLabel].default);
          }
        });
        // 이미 active였으면 default로 남기고, 아니면 active로 변경
        if (!isActive && path) {
          path.setAttribute('d', navIconMap[label].active);
        }
      });
    });
  }

  // ─── 계정 드롭다운 ─────────────────────────────────
  function initAccountDropdown() {
    const btn = document.querySelector('[data-test-id="header-accounts-options-button"]');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const existing = document.getElementById('account-dropdown');
      if (existing) {
        existing.remove();
        return;
      }

      closeAllMenus();
      const dropdown = document.createElement('div');
      dropdown.id = 'account-dropdown';
      dropdown.className = 'dropdown-menu';
      dropdown.innerHTML =
          '<div class="dropdown-menu__section">' +
          '<div class="dropdown-menu__header">현재 로그인</div>' +
          '<a href="/profile" class="dropdown-menu__user" style="text-decoration:none;color:inherit;cursor:pointer;">' +
          '<img class="dropdown-menu__avatar" src="' + LOCAL_PROFILE_IMAGE + '" alt="프로필">' +
          '<div class="dropdown-menu__user-info">' +
          '<div class="dropdown-menu__user-name">사용자</div>' +
          '</div>' +
          '</a>' +
          '</div>' +
          '<div class="dropdown-menu__divider"></div>' +
          '<button class="dropdown-menu__item" onclick="event.stopPropagation(); showToast(\'대시보드 준비 중입니다. 현재는 작품 탐색 기능을 이용할 수 있습니다\')">대시보드</button>' +
          '<button class="dropdown-menu__item" onclick="event.stopPropagation(); showToast(\'문의는 hello@bideo.kr 로 보내주세요\')">고객 지원</button>' +
          '<div class="dropdown-menu__divider"></div>' +
          '<button class="dropdown-menu__item" onclick="event.stopPropagation()">로그아웃</button>';

      btn.closest('.slot-block').appendChild(dropdown);
    });
  }

  // ─── 만들기 메뉴 (사이드 패널) ────────────────────────
  function initCreateMenu() {
    const btn = document.querySelector('[aria-label="만들기"]');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const existing = document.getElementById('create-menu');
      if (existing) {
        existing.remove();
        resetAllNavIcons();
        return;
      }

      removeAllSidePanels();
      closeAllMenus();
      const nav = document.getElementById('VerticalNavContent');
      const panel = document.createElement('div');
      panel.id = 'create-menu';
      panel.className = 'side-panel';
      panel.innerHTML =
          '<div class="side-panel__header">' +
          '<h2 class="side-panel__title">만들기</h2>' +
          '<button class="side-panel__close" aria-label="만들기 옵션 닫기" type="button">' +
          '<svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg>' +
          '</button>' +
          '</div>' +
          '<div class="side-panel__body">' +
          '<a href="/work/work-register" class="side-panel__menu-item" onclick="event.stopPropagation();">' +
          '<div class="side-panel__menu-icon">' +
          '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M5 3h2a1 1 0 0 1 1 1v3.69l-.92.2a5 5 0 0 0-3.97 4.66l-.1 2.4A1 1 0 0 0 4 16h7v2.3q0 2.7.66 5.33l.09.37h.5l.1-.37a22 22 0 0 0 .65-5.34V16h7a1 1 0 0 0 1-1.1l-.24-2.58a5 5 0 0 0-3.9-4.43l-.86-.2V4a1 1 0 0 1 1-1h2V1H5zm5 1a3 3 0 0 0-.17-1h4.34A3 3 0 0 0 14 4v5.3l2.43.54a3 3 0 0 1 2.34 2.66l.13 1.5H5.05l.06-1.36a3 3 0 0 1 2.38-2.8L10 9.31z"></path></svg>' +
          '</div>' +
          '<div class="side-panel__menu-text">' +
          '<div class="side-panel__menu-title">작품</div>' +
          '<div class="side-panel__menu-desc">당신의 작품을 게시할 수 있습니다.</div>' +
          '</div>' +
          '</a>' +
          '<a href="/gallery-register" class="side-panel__menu-item" onclick="event.stopPropagation();">' +
          '<div class="side-panel__menu-icon">' +
          '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M23 5a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4zm-10 6V3h6a2 2 0 0 1 2 2v6zm8 8a2 2 0 0 1-2 2h-6v-8h8zM5 3h6v18H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2"></path></svg>' +
          '</div>' +
          '<div class="side-panel__menu-text">' +
          '<div class="side-panel__menu-title">예술관</div>' +
          '<div class="side-panel__menu-desc">예술관을 구성해 작품을 주제별로 소개하세요.</div>' +
          '</div>' +
          '</a>' +
          '<a href="/contest/register" class="side-panel__menu-item" onclick="event.stopPropagation();">' +
          '<div class="side-panel__menu-icon">' +
          '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M19.95 1h-4.82a4 4 0 0 0-3.44-.66L3.97 2.4a4 4 0 0 0-2.83 4.9l.25.95a5 5 0 0 1 2-.24l-.32-1.23a2 2 0 0 1 1.41-2.45l7.73-2.07a2 2 0 0 1 2.45 1.41l3.62 13.53a2 2 0 0 1-1.41 2.45l-1.53.4a2 2 0 0 1-.27 1.43L14.13 23h5.82a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4M16.6 3.17 16.54 3h3.41a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-1.3a4 4 0 0 0 1.57-4.31zM4.86 18.64l.48-.33 4.98 2.66q.59.4 1.25.4a2.2 2.2 0 0 0 1.78-.93L7.34 17l6-3.44a2.2 2.2 0 0 0-3.02-.53l-4.98 2.66-.48-.33a3 3 0 1 0-3.48.17L3.6 17l-2.22 1.47a3 3 0 1 0 3.48.17M4 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-2-8a1 1 0 1 1 2 0 1 1 0 0 1-2 0"></path></svg>' +
          '</div>' +
          '<div class="side-panel__menu-text">' +
          '<div class="side-panel__menu-title">공모전</div>' +
          '<div class="side-panel__menu-desc">공모전을 올려 당신이 원하는 것을 얻으세요.</div>' +
          '</div>' +
          '</a>' +
          '</div>';

      panel.addEventListener('click', function (e) {
        e.stopPropagation();
      });
      nav.after(panel);

      panel.querySelector('.side-panel__close').addEventListener('click', function (e) {
        e.stopPropagation();
        panel.remove();
        resetAllNavIcons();
      });
    });
  }

  // ─── 알림 패널 ───────────────────────────────────
  function initUpdatePanel() {
    const btn = document.querySelector('[aria-label="알림"]');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const existing = document.getElementById('update-menu');
      if (existing) {
        existing.remove();
        resetAllNavIcons();
        return;
      }

      removeAllSidePanels();
      closeAllMenus();
      const nav = document.getElementById('VerticalNavContent');
      const panel = document.createElement('div');
      panel.id = 'update-menu';
      panel.className = 'side-panel';
      panel.innerHTML = buildAlarmPanelShell();

      panel.addEventListener('click', function (e) {
        e.stopPropagation();
      });
      nav.after(panel);

      panel.querySelector('.side-panel__close').addEventListener('click', function (e) {
        e.stopPropagation();
        panel.remove();
        resetAllNavIcons();
      });

      loadNotificationsFromAPI(panel);
    });
  }

  function buildAlarmPanelShell() {
    return `
      <div class="side-panel__header" style="padding: 24px 20px 12px; display:flex; justify-content:space-between; align-items:center;">
        <h2 class="side-panel__title" style="font-size:18px; font-weight:700; margin:0;">알림</h2>
        <button class="side-panel__close button-reset icon-container rounded-circle" style="width:32px; height:32px;"><svg height="16" viewBox="0 0 24 24" width="16"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg></button>
      </div>
      <div class="side-panel__body" id="alarm-list-body">
        <div style="padding:40px 16px; text-align:center; color:#767676; font-size:14px;">불러오는 중...</div>
      </div>`;
  }

  function formatNotiTime(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    if (diff < 172800) return '어제';
    return Math.floor(diff / 86400) + '일 전';
  }

  function renderAlarmItems(notifications) {
    if (!notifications || notifications.length === 0) {
      return '<div style="padding:40px 16px; text-align:center; color:#767676; font-size:14px;">알림이 없습니다.</div>';
    }

    const systemTypes = ['AUCTION_END', 'SETTLEMENT'];

    return notifications.map(function (n, i) {
      const userName = n.senderNickname || 'BIDEO';
      const isSystem = !n.senderId || systemTypes.indexOf(n.notiType) !== -1;
      const avatarSrc = n.senderProfileImage || LOCAL_PROFILE_IMAGE;
      const time = formatNotiTime(n.createdDatetime);
      const unreadDot = !n.isRead
          ? '<div style="width:8px; height:8px; background:#f0d999; border-radius:50%; flex-shrink:0;"></div>'
          : '';

      return '<div class="side-panel__update-item" style="padding:12px 16px; display:flex; align-items:center; gap:12px; cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background=\'#f0f0f0\'" onmouseout="this.style.background=\'none\'">'
          + '<img src="' + avatarSrc + '" style="width:48px; height:48px; border-radius:50%; object-fit:cover;">'
          + '<div style="flex:1;">'
          + '<div style="font-size:14px; color:#111; line-height:1.4;"><strong>' + userName + '</strong> ' + n.message + '</div>'
          + '<div style="font-size:12px; color:#767676; margin-top:2px;">' + time + '</div>'
          + '</div>'
          + unreadDot
          + '</div>';
    }).join('');
  }

  function loadNotificationsFromAPI(panel) {
    const body = panel.querySelector('#alarm-list-body');

    fetch('/api/notifications')
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          body.innerHTML = renderAlarmItems(data);
        })
        .catch(function () {
          body.innerHTML = renderAlarmItems(getFallbackAlarms());
        });
  }

  function getFallbackAlarms() {
    return [
      {senderNickname: '정찬호', message: '님이 경매를 시작하였습니다.', notiType: 'BID', isRead: false, createdDatetime: new Date().toISOString()},
      {senderNickname: 'BIDEO', message: '경매 종료 임박! 마지막 입찰 기회를 놓치지 마세요.', notiType: 'AUCTION_END', isRead: false, createdDatetime: new Date(Date.now() - 600000).toISOString()},
      {senderNickname: '이수진', message: '님이 당신의 작품에 좋아요를 눌렀습니다.', notiType: 'LIKE', isRead: true, createdDatetime: new Date(Date.now() - 86400000).toISOString()}
    ];
  }

  // ─── 메시지 패널 헬퍼 함수들 ─────────────────────────
  // WebSocket 관련 변수
  let msgStompClient = null;
  let msgSubscribedRooms = new Set();
  let msgCurrentRoomId = null;

  function msgTimeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return '방금';
    if (diff < 3600) return Math.floor(diff / 60) + '분';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간';
    if (diff < 604800) return Math.floor(diff / 86400) + '일';
    return (date.getMonth() + 1) + '/' + date.getDate();
  }

  function msgEscapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function msgConnectWebSocket() {
    if (msgStompClient && msgStompClient.connected) return;
    try {
      const socket = new SockJS('/ws');
      msgStompClient = Stomp.over(socket);
      msgStompClient.debug = null;
      msgStompClient.connect({}, function() {}, function() {
        setTimeout(msgConnectWebSocket, 5000);
      });
    } catch (e) { /* ignore */ }
  }

  function msgSubscribeRoom(roomId) {
    if (!msgStompClient || !msgStompClient.connected) return;
    if (msgSubscribedRooms.has(roomId)) return;
    msgStompClient.subscribe('/topic/room.' + roomId, function(frame) {
      const msg = JSON.parse(frame.body);
      if (msgCurrentRoomId === roomId) {
        const chatBody = document.querySelector('#message-menu .msg-chat-body');
        if (chatBody) {
          chatBody.insertAdjacentHTML('beforeend', buildChatBubble(msg));
          chatBody.scrollTop = chatBody.scrollHeight;
          fetch('/api/messages/rooms/' + roomId + '/read', { method: 'PATCH' }).catch(function(){});
        }
      }
      updateMsgUnreadBadge();
    });
    msgSubscribedRooms.add(roomId);
  }

  function updateMsgUnreadBadge() {
    fetch('/api/messages/unread-count')
      .then(function(res) { return res.ok ? res.json() : null; })
      .then(function(data) {
        if (!data) return;
        const btn = document.querySelector('[aria-label="메시지"]');
        if (!btn) return;
        let badge = btn.querySelector('.msg-unread-badge');
        const count = data.count || 0;
        if (count > 0) {
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'msg-unread-badge';
            badge.style.cssText = 'position:absolute;top:4px;right:4px;background:#e60023;color:#fff;border-radius:50%;min-width:18px;height:18px;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;';
            const wrap = btn.querySelector('.side-nav__icon-wrap');
            if (wrap) { wrap.style.position = 'relative'; wrap.appendChild(badge); }
          }
          badge.textContent = count > 99 ? '99+' : count;
          badge.style.display = 'flex';
        } else if (badge) {
          badge.style.display = 'none';
        }
      }).catch(function(){});
  }

  function buildChatBubble(msg) {
    const currentUserId = window.__bideoUserId;
    const isMine = msg.senderId === currentUserId;
    if (isMine) {
      return '<div style="align-self:flex-end;background:#111;color:#fff;padding:10px 14px;border-radius:18px;max-width:75%;font-size:14px;line-height:1.4;margin-bottom:4px;">' + msgEscapeHtml(msg.content) + '</div>';
    }
    const avatar = msg.senderProfileImage || LOCAL_PROFILE_IMAGE;
    return '<div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:4px;">' +
      '<img src="' + msgEscapeHtml(avatar) + '" style="width:24px;height:24px;border-radius:50%;flex-shrink:0;">' +
      '<div style="background:#efefef;padding:10px 14px;border-radius:18px;max-width:75%;font-size:14px;color:#111;line-height:1.4;">' + msgEscapeHtml(msg.content) + '</div>' +
      '</div>';
  }

  function buildMessageListHTML() {
    return '<style>#message-menu *:focus { outline: none; }</style>' +
        '<div class="side-panel">' +
        '<div class="side-panel__header">' +
        '<h2 class="side-panel__title">메시지</h2>' +
        '<button aria-label="닫기" class="side-panel__close" tabindex="0" type="button">' +
        '<svg aria-hidden="true" class="icon-svg display-block icon-color-default" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg>' +
        '</button>' +
        '</div>' +
        '<div data-test-id="chat-window-container" id="full-height-inbox-panel" tabindex="-1" class="side-panel__body">' +
        '<div data-test-id="full-height-inbox-container">' +
        '<div data-test-id="compose-new-message-button" class="side-panel__msg-compose" role="button" tabindex="0">' +
        '<div class="side-panel__msg-compose-icon">' +
        '<svg aria-label="새 메시지 작성" class="icon-svg display-block" height="20" role="img" viewBox="0 0 24 24" width="20" style="color:#111"><path d="M23.3458 0.633387C22.4924 -0.211454 21.1083 -0.211454 20.2549 0.633387L18.7363 2.13571L21.8272 5.1931L23.3727 3.66441C24.2268 2.82023 24.1999 1.47756 23.3458 0.633387ZM17.762 3.10349L9.39669 11.3893L8.35883 15.6412L12.4876 14.4467L20.8963 6.23791L17.762 3.10349ZM4.70156 1.01393C2.10496 1.01393 0 3.16788 0 5.82491V19.1887C0 21.8458 2.10496 23.9997 4.70156 23.9997H18.2838C20.8804 23.9997 22.9854 21.8458 22.9854 19.1887V14.074C22.9854 13.1884 22.2838 12.5068 21.4182 12.5068C20.5527 12.5068 19.851 13.1884 19.851 14.074V19.1887C19.851 20.0744 19.1494 20.7924 18.2838 20.7924H4.70156C3.83603 20.7924 3.13437 20.0744 3.13437 19.1887V5.82491C3.13437 4.93923 3.83603 4.22125 4.70156 4.22125H9.92552C10.7911 4.22125 11.4927 3.50326 11.4927 2.61759C11.4927 1.73191 10.7911 1.01393 9.92552 1.01393H4.70156Z"></path></svg>' +
        '</div>' +
        '<div class="side-panel__msg-compose-text">새 메시지</div>' +
        '</div>' +
        '<h3 class="side-panel__msg-section-title">메시지</h3>' +
        '<div data-test-id="conversation-list-container" class="side-panel__msg-list">' +
        '<div class="side-panel__msg-loading" style="text-align:center;padding:32px;color:#767676;">불러오는 중...</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
  }

  function loadMessageRooms(panel) {
    const listContainer = panel.querySelector('[data-test-id="conversation-list-container"]');
    if (!listContainer) return;

    fetch('/api/messages/rooms')
      .then(function(res) { return res.ok ? res.json() : []; })
      .then(function(rooms) {
        if (!rooms || rooms.length === 0) {
          listContainer.innerHTML = '<div style="text-align:center;padding:32px;color:#767676;font-size:14px;">아직 메시지가 없습니다.</div>';
          return;
        }
        let html = '';
        rooms.forEach(function(room) {
          const partner = room.members && room.members[0];
          const name = partner ? msgEscapeHtml(partner.nickname) : '알 수 없음';
          const avatar = partner && partner.profileImage ? msgEscapeHtml(partner.profileImage) : LOCAL_PROFILE_IMAGE;
          const preview = msgEscapeHtml(room.lastMessage || '');
          const time = msgTimeAgo(room.lastMessageAt);
          const unread = room.unreadCount > 0 ? '<span style="background:#e60023;color:#fff;border-radius:50%;min-width:18px;height:18px;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 4px;">' + (room.unreadCount > 99 ? '99+' : room.unreadCount) + '</span>' : '';
          html += '<div data-test-id="conversation-list-item" class="side-panel__msg-item" role="button" tabindex="0" data-room-id="' + room.id + '" data-partner-name="' + name + '" data-partner-avatar="' + msgEscapeHtml(avatar) + '">' +
            '<img alt="' + name + '" class="side-panel__msg-avatar" draggable="false" loading="lazy" src="' + avatar + '">' +
            '<div class="side-panel__msg-info">' +
            '<div class="side-panel__msg-name">' + name + '</div>' +
            '<div class="side-panel__msg-preview">' + preview + '</div>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">' +
            '<div class="side-panel__msg-time">' + time + '</div>' +
            unread +
            '</div>' +
            '</div>';
          msgSubscribeRoom(room.id);
        });
        listContainer.innerHTML = html;
      })
      .catch(function() {
        listContainer.innerHTML = '<div style="text-align:center;padding:32px;color:#767676;font-size:14px;">메시지를 불러올 수 없습니다.</div>';
      });
  }

  function openChatDetail(panel, roomId, partnerName, partnerAvatar) {
    msgCurrentRoomId = roomId;
    msgSubscribeRoom(roomId);

    const sidePanel = panel.querySelector('.side-panel');
    if (!sidePanel) return;

    sidePanel.innerHTML =
      '<div class="side-panel__header" style="padding:12px 16px;border-bottom:1px solid #efefef;display:flex;align-items:center;gap:12px;">' +
      '<button class="msg-back-btn button-reset" style="background:none;border:none;cursor:pointer;padding:4px;" tabindex="0">' +
      '<svg height="20" viewBox="0 0 24 24" width="20"><path d="m6.41 12 10.3-10.3L15.29.3 3.6 12l11.7 11.7 1.42-1.4z"></path></svg>' +
      '</button>' +
      '<img src="' + msgEscapeHtml(partnerAvatar) + '" style="width:32px;height:32px;border-radius:50%;">' +
      '<span style="font-weight:700;font-size:16px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + msgEscapeHtml(partnerName) + '</span>' +
      '<button aria-label="닫기" class="side-panel__close button-reset" style="background:none;border:none;cursor:pointer;padding:4px;" tabindex="0">' +
      '<svg height="16" viewBox="0 0 24 24" width="16"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg>' +
      '</button>' +
      '</div>' +
      '<div class="msg-chat-body" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:4px;">' +
      '<div style="text-align:center;padding:32px;color:#767676;">불러오는 중...</div>' +
      '</div>' +
      '<div style="padding:12px 16px;border-top:1px solid #efefef;background:#fff;">' +
      '<form class="msg-send-form" style="display:flex;align-items:center;background:#efefef;border-radius:24px;padding:4px 4px 4px 16px;gap:8px;">' +
      '<input type="text" class="msg-send-input" placeholder="메시지 보내기" style="border:none;background:transparent;flex:1;outline:none;font-size:15px;padding:8px 0;" autocomplete="off">' +
      '<button type="submit" class="button-reset" style="width:40px;height:40px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;">' +
      '<svg height="20" viewBox="0 0 24 24" width="20" fill="#111"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>' +
      '</button>' +
      '</form>' +
      '</div>';

    // 메시지 로드
    const chatBody = sidePanel.querySelector('.msg-chat-body');
    fetch('/api/messages/rooms/' + roomId + '/messages')
      .then(function(res) { return res.ok ? res.json() : []; })
      .then(function(messages) {
        if (messages.length === 0) {
          chatBody.innerHTML = '<div style="text-align:center;padding:32px;color:#767676;font-size:14px;">첫 메시지를 보내보세요!</div>';
        } else {
          chatBody.innerHTML = messages.map(buildChatBubble).join('');
          chatBody.scrollTop = chatBody.scrollHeight;
        }
      })
      .catch(function() {
        chatBody.innerHTML = '<div style="text-align:center;padding:32px;color:#767676;">메시지를 불러올 수 없습니다.</div>';
      });

    // 읽음 처리
    fetch('/api/messages/rooms/' + roomId + '/read', { method: 'PATCH' }).catch(function(){});
    updateMsgUnreadBadge();

    // 전송 이벤트
    const form = sidePanel.querySelector('.msg-send-form');
    const input = sidePanel.querySelector('.msg-send-input');
    form.addEventListener('submit', function(ev) {
      ev.preventDefault();
      const content = input.value.trim();
      if (!content) return;
      input.value = '';
      fetch('/api/messages/rooms/' + roomId + '/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content })
      }).then(function(res) { return res.ok ? res.json() : null; })
        .then(function(msg) {
          if (!msg) return;
          // WebSocket이 브로드캐스트 하지만, 연결 안 되어 있을 경우 직접 추가
          if (!msgStompClient || !msgStompClient.connected) {
            chatBody.insertAdjacentHTML('beforeend', buildChatBubble(msg));
            chatBody.scrollTop = chatBody.scrollHeight;
          }
        }).catch(function(){});
    });

    // 뒤로 가기
    sidePanel.querySelector('.msg-back-btn').addEventListener('click', function(ev) {
      ev.stopPropagation();
      msgCurrentRoomId = null;
      sidePanel.innerHTML = '';
      panel.querySelector('.side-panel') || panel.appendChild(document.createElement('div'));
      // 패널 전체를 다시 렌더링
      const nav = document.getElementById('VerticalNavContent');
      panel.remove();
      resetAllNavIcons();
      document.querySelector('[aria-label="메시지"]').click();
    });

    // 닫기
    sidePanel.querySelector('.side-panel__close').addEventListener('click', function(ev) {
      ev.stopPropagation();
      msgCurrentRoomId = null;
      panel.remove();
      resetAllNavIcons();
    });
  }

  // ─── 메시지 패널 ─────────────────────────────────────
  function initMessagePanel() {
    const btn = document.querySelector('[aria-label="메시지"]');
    if (!btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const existing = document.getElementById('message-menu');
      if (existing) {
        existing.remove();
        msgCurrentRoomId = null;
        resetAllNavIcons();
        return;
      }

      removeAllSidePanels();
      closeAllMenus();
      const nav = document.getElementById('VerticalNavContent');
      const panel = document.createElement('div');
      panel.id = 'message-menu';
      panel.className = 'layout-box';
      panel.style.cssText = 'opacity:1;transition:opacity .3s ease-in-out';
      panel.innerHTML = buildMessageListHTML();

      panel.addEventListener('click', function (e) {
        e.stopPropagation();
      });
      nav.after(panel);

      // 채팅방 목록 API 로드
      loadMessageRooms(panel);

      // 닫기 버튼
      panel.querySelector('[aria-label="닫기"]').addEventListener('click', function (e) {
        e.stopPropagation();
        msgCurrentRoomId = null;
        panel.remove();
        resetAllNavIcons();
      });

      // ── 새 메시지 버튼 클릭 → 새 메시지 작성 패널 (API 검색) ──
      const newMsgBtn = panel.querySelector('[data-test-id="compose-new-message-button"]');
      if (newMsgBtn) {
        newMsgBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          openNewMessagePanel(panel, btn);
        });
      }

      // ── 대화방 아이템 클릭 이벤트 위임 ──
      const listContainer = panel.querySelector('[data-test-id="conversation-list-container"]');
      if (listContainer) {
        listContainer.addEventListener('click', function (ev) {
          const item = ev.target.closest('[data-test-id="conversation-list-item"]');
          if (!item) return;
          ev.stopPropagation();
          const roomId = parseInt(item.getAttribute('data-room-id'), 10);
          const partnerName = item.getAttribute('data-partner-name');
          const partnerAvatar = item.getAttribute('data-partner-avatar');
          openChatDetail(panel, roomId, partnerName, partnerAvatar);
        });
      }
    });
  }

  // ─── 새 메시지 패널 (API 검색) ────────────────────────
  function openNewMessagePanel(panel, msgBtn) {
    const sidePanel = panel.querySelector('.side-panel');
    if (!sidePanel) return;

    sidePanel.innerHTML =
      '<div class="side-panel__header" style="padding:12px 16px;border-bottom:1px solid #efefef;display:flex;align-items:center;gap:12px;">' +
      '<button class="msg-back-btn button-reset" style="background:none;border:none;cursor:pointer;padding:4px;" tabindex="0">' +
      '<svg height="20" viewBox="0 0 24 24" width="20"><path d="m6.41 12 10.3-10.3L15.29.3 3.6 12l11.7 11.7 1.42-1.4z"></path></svg>' +
      '</button>' +
      '<span style="font-weight:700;font-size:16px;flex:1;">새 메시지</span>' +
      '<button aria-label="닫기" class="side-panel__close button-reset" style="background:none;border:none;cursor:pointer;padding:4px;" tabindex="0">' +
      '<svg height="16" viewBox="0 0 24 24" width="16"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg>' +
      '</button>' +
      '</div>' +
      '<div style="padding:12px 16px;">' +
      '<div style="background:#efefef;border-radius:24px;padding:10px 16px;display:flex;align-items:center;gap:12px;">' +
      '<svg height="16" viewBox="0 0 24 24" width="16" style="color:#767676;flex-shrink:0;"><path d="M17.33 18.74a10 10 0 1 1 1.41-1.41l4.47 4.47-1.41 1.41zM11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16"></path></svg>' +
      '<input type="text" class="msg-member-search" placeholder="이름 검색" style="border:none;background:transparent;flex:1;outline:none;font-size:15px;" autocomplete="off">' +
      '</div>' +
      '</div>' +
      '<div class="msg-search-results" style="flex:1;overflow-y:auto;padding:0 16px;">' +
      '<div style="text-align:center;padding:40px;color:#767676;font-size:14px;">이름을 검색하세요.</div>' +
      '</div>';

    const searchInput = sidePanel.querySelector('.msg-member-search');
    const resultsDiv = sidePanel.querySelector('.msg-search-results');
    let searchTimer = null;

    searchInput.focus();

    searchInput.addEventListener('input', function () {
      const keyword = this.value.trim();
      if (searchTimer) clearTimeout(searchTimer);
      if (!keyword) {
        resultsDiv.innerHTML = '<div style="text-align:center;padding:40px;color:#767676;font-size:14px;">이름을 검색하세요.</div>';
        return;
      }
      searchTimer = setTimeout(function () {
        fetch('/api/messages/search-members?keyword=' + encodeURIComponent(keyword))
          .then(function (res) { return res.ok ? res.json() : []; })
          .then(function (members) {
            if (!members || members.length === 0) {
              resultsDiv.innerHTML = '<div style="text-align:center;padding:40px;color:#767676;font-size:14px;">검색 결과가 없습니다.</div>';
              return;
            }
            let html = '';
            members.forEach(function (m, i) {
              const avatar = m.profileImage ? msgEscapeHtml(m.profileImage) : LOCAL_PROFILE_IMAGE;
              html += '<div class="msg-search-member" data-member-id="' + m.id + '" data-nickname="' + msgEscapeHtml(m.nickname) + '" data-avatar="' + msgEscapeHtml(avatar) + '" ' +
                'style="display:flex;align-items:center;gap:12px;padding:10px 8px;border-radius:12px;cursor:pointer;transition:background .2s;" ' +
                'onmouseover="this.style.background=\'#f0f0f0\'" onmouseout="this.style.background=\'transparent\'">' +
                '<img src="' + avatar + '" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">' +
                '<div style="flex:1;overflow:hidden;">' +
                '<div style="font-weight:600;font-size:15px;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + msgEscapeHtml(m.nickname) + '</div>' +
                '</div>' +
                '</div>';
            });
            resultsDiv.innerHTML = html;
          })
          .catch(function () {
            resultsDiv.innerHTML = '<div style="text-align:center;padding:40px;color:#767676;font-size:14px;">검색에 실패했습니다.</div>';
          });
      }, 300);
    });

    // 검색 결과 멤버 클릭 → 방 생성/기존방 → 채팅 상세
    resultsDiv.addEventListener('click', function (ev) {
      const item = ev.target.closest('.msg-search-member');
      if (!item) return;
      const memberId = parseInt(item.getAttribute('data-member-id'), 10);
      const nickname = item.getAttribute('data-nickname');
      const avatar = item.getAttribute('data-avatar');

      fetch('/api/messages/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberIds: [memberId] })
      })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (room) {
          if (!room) { showToast('채팅방을 생성할 수 없습니다.'); return; }
          openChatDetail(panel, room.id, nickname, avatar);
        })
        .catch(function () { showToast('오류가 발생했습니다.'); });
    });

    // 뒤로 가기
    sidePanel.querySelector('.msg-back-btn').addEventListener('click', function (ev) {
      ev.stopPropagation();
      panel.remove();
      resetAllNavIcons();
      msgBtn.click();
    });

    // 닫기
    sidePanel.querySelector('.side-panel__close').addEventListener('click', function (ev) {
      ev.stopPropagation();
      panel.remove();
      resetAllNavIcons();
    });
  }

  // ─── 설정 패널 ─────────────────────────────────────
  function initSettingsPanel() {
    const btn = document.querySelector('[aria-label="대시보드"]');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      showToast('대시보드 준비 중입니다. 현재는 작품 탐색과 상세 보기 기능을 이용할 수 있습니다');
    });
  }

  function initSupportButton() {
    const btn = document.querySelector('[aria-label="고객 지원"]');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      showToast('고객 지원: hello@bideo.kr');
    });
  }

  // ─── 전역 클릭/ESC에서 네비 관련 처리 ──────────────────
  document.addEventListener('click', function () {
    const accountDD = document.getElementById('account-dropdown');
    if (accountDD) accountDD.remove();
    removeAllSidePanels();
    resetAllNavIcons();
  });

  // ─── 초기화 ─────────────────────────────────────────
  initNavTooltips();
  initNavIconToggle();
  initAccountDropdown();
  initCreateMenu();
  initUpdatePanel();
  initMessagePanel();
  initSettingsPanel();
  initSupportButton();
  resetAllNavIcons();

  // WebSocket 연결 및 안읽은 메시지 뱃지
  msgConnectWebSocket();
  updateMsgUnreadBadge();
});

