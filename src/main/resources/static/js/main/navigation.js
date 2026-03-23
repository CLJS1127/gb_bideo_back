// ─── 공유 유틸리티 (main.js, closeup.js에서도 사용) ──────
var LOCAL_PROFILE_IMAGE = '/images/BIDEO_LOGO/BIDEO_favicon.png';

var placeholderPalettes = [
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
    '내 프로필': {
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
    setHomeNavIconActive();
  }

  function setHomeNavIconActive() {
    const nav = document.getElementById('VerticalNavContent');
    if (!nav) return;

    const homeButton = Array.from(nav.querySelectorAll('a[aria-label], button[aria-label]')).find(function (btn) {
      return btn.getAttribute('aria-label') === '홈' && btn.querySelector('svg path');
    });

    if (!homeButton) return;

    const path = homeButton.querySelector('svg path');
    if (path) path.setAttribute('d', navIconMap['홈'].active);
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
          '<div class="dropdown-menu__user">' +
          '<img class="dropdown-menu__avatar" src="' + LOCAL_PROFILE_IMAGE + '" alt="프로필">' +
          '<div class="dropdown-menu__user-info">' +
          '<div class="dropdown-menu__user-name">사용자</div>' +
          '</div>' +
          '</div>' +
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
      panel.className = 'layout-box';
      panel.style.cssText = 'opacity:1;transition:opacity .3s ease-in-out';
      panel.innerHTML =
          '<div class="layout-box surface-default layout-fixed" style="margin-left:72px;border-right:1px solid rgb(233,233,233);height:100vh;width:384px;z-index:672">' +
          '<div class="layout-box u-pad-inline-300 u-margin-top-300 u-pad-block-300">' +
          '<div class="flex-row spacing-inline-zero spacing-block-zero u-row-bottom-40 justify-between items-center">' +
          '<h3 class="heading-margin-reset text-antialiased text-default heading-400 heading-align-start heading-break-word">만들기</h3>' +
          '<button class="button-reset" aria-label="만들기 옵션 닫기">' +
          '<div class="button-reset-inner interactive-scale cursor-pointer-inner">' +
          '<svg class="icon-container rounded-200 icon-surface-transparent" viewBox="0 0 24 24" width="20" height="20"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg>' +
          '</div>' +
          '</button>' +
          '</div>' +
          '<div class="flex-row u-inline-gap-300 u-stack-gap-300 flex-column">' +
          '<div class="slot-block">' +
          '<style>.slot-block:hover .create-item-hover{background-color:rgb(228,228,228)}</style>' +
          '<div class="layout-box create-item-hover" style="border-radius:16px">' +
          '<button type="button" onclick="event.stopPropagation(); showToast(\'작품 등록 기능은 현재 준비 중입니다\')" style="width:100%;padding:0;border:none;background:none;text-align:left;color:inherit;display:block">' +
          '<div class="layout-box u-pad-inline-300 u-rounded-200-card u-pad-block-200 u-bg-transparent flex-row-container">' +
          '<div class="layout-box section-padding-x-400 section-padding-y-400 rounded-400 u-bg-secondary">' +
          '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M5 3h2a1 1 0 0 1 1 1v3.69l-.92.2a5 5 0 0 0-3.97 4.66l-.1 2.4A1 1 0 0 0 4 16h7v2.3q0 2.7.66 5.33l.09.37h.5l.1-.37a22 22 0 0 0 .65-5.34V16h7a1 1 0 0 0 1-1.1l-.24-2.58a5 5 0 0 0-3.9-4.43l-.86-.2V4a1 1 0 0 1 1-1h2V1H5zm5 1a3 3 0 0 0-.17-1h4.34A3 3 0 0 0 14 4v5.3l2.43.54a3 3 0 0 1 2.34 2.66l.13 1.5H5.05l.06-1.36a3 3 0 0 1 2.38-2.8L10 9.31z"></path></svg>' +
          '</div>' +
          '<div class="layout-box u-margin-inline-start-300">' +
          '<div class="text-dark text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-regular">작품</div>' +
          '<div class="text-subtle text-align-start text-break-word text-with-inline-icon text-antialiased text-body-200-leading text-body-200 text-body-200-regular">당신의 작품을 게시할 수 있습니다.</div>' +
          '</div>' +
          '</div>' +
          '</button>' +
          '</div>' +
          '</div>' +
          '<div class="slot-block">' +
          '<style>.slot-block:hover .board-item-hover{background-color:rgb(228,228,228)}</style>' +
          '<div class="layout-box board-item-hover" style="border-radius:16px">' +
          '<div role="button" tabindex="0" style="cursor:pointer">' +
          '<div class="layout-box u-pad-inline-300 u-rounded-200-card u-pad-block-200 u-bg-transparent flex-row-container">' +
          '<div class="layout-box section-padding-x-400 section-padding-y-400 rounded-400 u-bg-secondary">' +
          '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M23 5a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4zm-10 6V3h6a2 2 0 0 1 2 2v6zm8 8a2 2 0 0 1-2 2h-6v-8h8zM5 3h6v18H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2"></path></svg>' +
          '</div>' +
          '<div class="layout-box u-margin-inline-start-300">' +
          '<div class="text-dark text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-regular">컬렉션</div>' +
          '<div class="text-subtle text-align-start text-break-word text-with-inline-icon text-antialiased text-body-200-leading text-body-200 text-body-200-regular">컬렉션을 구성해 작품을 주제별로 소개하세요.</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '<div class="slot-block">' +
          '<style>.slot-block:hover .collage-item-hover{background-color:rgb(228,228,228)}</style>' +
          '<div class="layout-box collage-item-hover" style="border-radius:16px">' +
          '<button type="button" onclick="event.stopPropagation(); showToast(\'큐레이션 보드 기능은 현재 준비 중입니다\')" style="width:100%;padding:0;border:none;background:none;text-align:left;color:inherit;display:block">' +
          '<div class="layout-box u-pad-inline-300 u-rounded-200-card u-pad-block-200 u-bg-transparent flex-row-container">' +
          '<div class="layout-box section-padding-x-400 section-padding-y-400 rounded-400 u-bg-secondary">' +
          '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M19.95 1h-4.82a4 4 0 0 0-3.44-.66L3.97 2.4a4 4 0 0 0-2.83 4.9l.25.95a5 5 0 0 1 2-.24l-.32-1.23a2 2 0 0 1 1.41-2.45l7.73-2.07a2 2 0 0 1 2.45 1.41l3.62 13.53a2 2 0 0 1-1.41 2.45l-1.53.4a2 2 0 0 1-.27 1.43L14.13 23h5.82a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4M16.6 3.17 16.54 3h3.41a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-1.3a4 4 0 0 0 1.57-4.31zM4.86 18.64l.48-.33 4.98 2.66q.59.4 1.25.4a2.2 2.2 0 0 0 1.78-.93L7.34 17l6-3.44a2.2 2.2 0 0 0-3.02-.53l-4.98 2.66-.48-.33a3 3 0 1 0-3.48.17L3.6 17l-2.22 1.47a3 3 0 1 0 3.48.17M4 21a1 1 0 1 1-2 0 1 1 0 0 1 2 0m-2-8a1 1 0 1 1 2 0 1 1 0 0 1-2 0"></path></svg>' +
          '</div>' +
          '<div class="layout-box u-margin-inline-start-300">' +
          '<div class="text-dark text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-regular">공모전</div>' +
          '<div class="text-subtle text-align-start text-break-word text-with-inline-icon text-antialiased text-body-200-leading text-body-200 text-body-200-regular">공모전을 올려 당신이 원하는 것을 얻으세요.</div>' +
          '</div>' +
          '</div>' +
          '</button>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</div>';

      panel.addEventListener('click', function (e) {
        e.stopPropagation();
      });
      nav.after(panel);

      panel.querySelector('[aria-label="만들기 옵션 닫기"]').addEventListener('click', function (e) {
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
      panel.className = 'side-panel'; // Pinterest 스타일 클래스 적용
      panel.innerHTML = buildAlarmListHTML();

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

  function buildAlarmListHTML() {
    const alarms = [
      {type: 'auction', user: '정찬호', msg: '님이 경매를 시작하였습니다.', time: '방금 전', thumb: true},
      {type: 'auction_deadline', user: 'BIDEO', msg: '경매 종료 임박! 마지막 입찰 기회를 놓치지 마세요.', time: '10분 전', gold: true},
      {type: 'auction_end', user: '경매 알림', msg: '경매가 종료되었습니다. 결과를 확인하세요.', time: '30분 전'},
      {type: 'purchase', user: '김작가', msg: '님이 당신의 작품을 구매하였습니다.', time: '1시간 전', thumb: true},
      {type: 'contest_rec', user: 'BIDEO', msg: '당신을 위한 공모전 추천: 2026 비디오 아트전', time: '2시간 전', gold: true},
      {type: 'contest_deadline', user: '공모전 위원회', msg: '참여 마감 임박! 2026 디지털 콜라주전', time: '3시간 전'},
      {type: 'like', user: '이수진', msg: '님이 당신의 작품에 좋아요를 눌렀습니다.', time: '어제', thumb: true},
      {type: 'request', user: '참여 요청', msg: '당신의 프로젝트에 15명의 참여 요청이 도착했습니다.', time: '2일 전', gold: true}
    ];

    let listItems = alarms.map((a, i) => `
      <div class="side-panel__update-item" style="padding:12px 16px; display:flex; align-items:center; gap:12px; cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='none'">
        <img src="${createAvatarDataUri(a.user, i)}" style="width:48px; height:48px; border-radius:50%;">
        <div style="flex:1;">
          <div style="font-size:14px; color:#111; line-height:1.4;"><strong>${a.user}</strong> ${a.msg}</div>
          <div style="font-size:12px; color:#767676; margin-top:2px;">${a.time}</div>
        </div>
        ${a.thumb ? `<div style="width:40px; height:40px; background:#eee; border-radius:8px; overflow:hidden;"><img src="${LOCAL_PROFILE_IMAGE}" style="width:100%; height:100%; object-fit:cover;"></div>` : ''}
        ${a.gold ? `<div style="width:8px; height:8px; background:#f0d999; border-radius:50%;"></div>` : ''}
      </div>
    `).join('');

    return `
      <div class="side-panel__header" style="padding: 24px 20px 12px; display:flex; justify-content:space-between; align-items:center;">
        <h2 class="side-panel__title" style="font-size:18px; font-weight:700; margin:0;">알림</h2>
        <button class="side-panel__close button-reset icon-container rounded-circle" style="width:32px; height:32px;"><svg height="16" viewBox="0 0 24 24" width="16"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg></button>
      </div>
      <div class="side-panel__body">${listItems}</div>`;
  }

  // ─── 메시지 패널 헬퍼 함수들 ─────────────────────────
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
        '<div data-test-id="conversation-list-item" class="side-panel__msg-item" role="button" tabindex="0">' +
        '<img alt="찬호" class="side-panel__msg-avatar" draggable="false" loading="lazy" src="' + createAvatarDataUri('정찬호', 22) + '">' +
        '<div class="side-panel__msg-info">' +
        '<div class="side-panel__msg-name">찬호</div>' +
        '<div class="side-panel__msg-preview">ㅎㅇ</div>' +
        '</div>' +
        '<div class="side-panel__msg-time">3일</div>' +
        '</div>' +
        '</div>' +
        '<div data-test-id="invite-friends-cta" class="side-panel__msg-invite" role="button" tabindex="0">' +
        '<div class="side-panel__msg-invite-icon">' +
        '<svg aria-label="친구 초대하기" class="icon-svg display-block icon-color-default" height="20" role="img" viewBox="0 0 24 24" width="20"><path d="M12 11a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M8.5 5.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0M3 23h9v-2H4.06a8 8 0 0 1 11.05-6.37l.78-1.85A10 10 0 0 0 2 22a1 1 0 0 0 1 1m17-3h4v-2h-4v-4h-2v4h-4v2h4v4h2z"></path></svg>' +
        '</div>' +
        '<div class="side-panel__msg-invite-text">' +
        '<div class="side-panel__msg-invite-title">친구 초대하기</div>' +
        '<div class="side-panel__msg-invite-desc">연결하여 채팅을 시작하세요.</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
  }

  function buildInviteFriendsHTML() {
    return '<div class="layout-box" style="padding-right:12px">' +
        '<div class="layout-box u-margin-top-300 u-margin-inline-600 u-pad-block-300 u-margin-bottom-600">' +
        '<div class="flex-row spacing-inline-zero spacing-block-zero u-row-bottom-40 justify-between items-center">' +
        '<h2 class="heading-margin-reset text-antialiased text-default heading-400 heading-align-start heading-break-word">메시지</h2>' +
        '<div class="flex-row spacing-inline-zero spacing-block-zero u-row-bottom-40">' +
        '<button aria-label="닫기" class="button-reset invite-close-btn" tabindex="0" type="button">' +
        '<div class="button-reset-inner interactive-scale cursor-pointer-inner">' +
        '<div class="icon-container rounded-200 icon-surface-transparent" style="height:28px;width:28px">' +
        '<svg aria-hidden="true" class="icon-svg display-block icon-color-default" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg>' +
        '</div>' +
        '</div>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="layout-box" style="height:calc(100% - 64px)">' +
        '<div data-test-id="invite-follow-container" class="layout-box u-pad-block-200 u-scroll-y" style="height:100%">' +
        '<div class="flex-row spacing-inline-zero spacing-block-zero flex-column items-center">' +
        '<div data-test-id="invite-follow-image" class="layout-box">' +
        '<svg fill="none" height="150" viewBox="0 0 150 150" width="150" xmlns="http://www.w3.org/2000/svg">' +
        '<mask fill="white" id="path-1-inside-1"><rect height="68" rx="1.5" transform="rotate(-5.75723 15 54.2305)" width="97" x="15" y="54.2305"></rect></mask>' +
        '<rect fill="#111" height="68" mask="url(#path-1-inside-1)" rx="1.5" stroke="black" stroke-width="4.5" transform="rotate(-5.75723 15 54.2305)" width="97" x="15" y="54.2305"></rect>' +
        '<mask fill="white" id="path-2-inside-2"><rect height="68" rx="1.5" transform="rotate(-5.75723 17.5 49.7305)" width="97" x="17.5" y="49.7305"></rect></mask>' +
        '<rect fill="white" height="68" mask="url(#path-2-inside-2)" rx="1.5" stroke="black" stroke-width="4.5" transform="rotate(-5.75723 17.5 49.7305)" width="97" x="17.5" y="49.7305"></rect>' +
        '<rect fill="#111" height="68" rx="1.5" width="97" x="31.5" y="33.5"></rect>' +
        '<mask fill="white" id="path-4-inside-3"><rect height="68" rx="1.5" width="97" x="35" y="30"></rect></mask>' +
        '<rect fill="white" height="68" mask="url(#path-4-inside-3)" rx="1.5" stroke="black" stroke-width="4.5" width="97" x="35" y="30"></rect>' +
        '<path d="M53.2202 52.4096C55.9628 52.2376 61.2672 49.7768 60.8053 41.3432C60.7979 41.2391 60.7916 41.1373 60.7863 41.0379C60.7935 41.1405 60.7998 41.2423 60.8053 41.3432C61.046 44.7072 62.4395 50.4178 66.2377 51.8918C66.5071 51.9964 66.5162 52.4985 66.2483 52.6067C63.977 53.524 61.432 56.1946 61.047 62.5048C61.0452 62.5383 61.0433 62.5714 61.0412 62.6043C61.0431 62.571 61.045 62.5378 61.047 62.5048C61.2353 59.0423 59.937 52.3302 53.2202 52.4096Z" fill="white" stroke="#111" stroke-linejoin="round" stroke-width="2.25"></path>' +
        '<path d="M45.9884 84.0499C48.4393 82.8984 52.0472 81.1962 53.3819 81.9567C55.0503 82.9072 54.0414 84.662 56.0184 84.4518C57.9955 84.2415 62.2058 80.961 63.6828 82.0552C65.1598 83.1495 64.9285 84.3355 67.523 83.9681C69.5986 83.6742 74.5646 83.4435 76.3261 83.1347" stroke="#111" stroke-linecap="round" stroke-width="2.25"></path>' +
        '<path d="M46.4777 76.2726C48.9286 75.121 54.1641 73.008 55.4988 73.7685C57.1672 74.719 55.6807 77.192 57.6577 76.9817C59.6348 76.7715 65.5416 72.9418 67.0186 74.036C68.4956 75.1303 66.3418 77.0185 68.9363 76.6511C71.012 76.3572 75.0538 75.6661 76.8153 75.3573" stroke="#111" stroke-linecap="round" stroke-width="2.25"></path>' +
        '<path d="M88.0762 38.6367L88.2995 89.6365" stroke="black" stroke-width="2.25"></path>' +
        '</svg>' +
        '</div>' +
        '<div data-test-id="education-text-block" class="layout-box section-padding-x-400 u-content-center section-padding-y-400 flex-row-container">' +
        '<div class="flex-row spacing-inline-zero spacing-block-zero flex-column">' +
        '<div class="layout-box display-block-wrapper u-margin-bottom-400">' +
        '<h2 class="heading-margin-reset text-antialiased text-default heading-300 text-center-heading heading-break-word">함께 아이디어 찾기</h2>' +
        '</div>' +
        '<div class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-regular">' +
        '<ol class="list-padding-reset list-first-item-indent list-margin-reset">' +
        '<li class="list-spaced-item list-decimal" style="font-size:var(--sema-font-size-body-300)">' +
        '<div class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-regular">' +
        '<div class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-strong">링크를 공유합니다.</div>' +
        '<div class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-100-leading text-body-100 text-body-100-regular">회원님에게 메시지를 보내려는 친구는 링크를 통해 회원님을 팔로우해야 합니다.</div>' +
        '</div>' +
        '</li>' +
        '<li class="list-spaced-item list-decimal" style="font-size:var(--sema-font-size-body-300)">' +
        '<div class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-regular">' +
        '<div class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-strong">친구들이 회원님을 팔로우합니다.</div>' +
        '<div class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-100-leading text-body-100 text-body-100-regular">각 링크는 한 번에 몇 명의 친구만 사용할 수 있지만 필요한 만큼 받을 수 있습니다.</div>' +
        '</div>' +
        '</li>' +
        '<li class="list-spaced-item list-decimal" style="font-size:var(--sema-font-size-body-300)">' +
        '<div class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-regular">' +
        '<div class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-strong">친구를 팔로우하세요!</div>' +
        '<div class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-100-leading text-body-100 text-body-100-regular">서로 팔로우하면 다이렉트 메시지를 통해 아이디어, 목표 등을 공유할 수 있습니다.</div>' +
        '</div>' +
        '</li>' +
        '</ol>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="layout-box">' +
        '<div class="flex-row spacing-inline-zero spacing-block-zero justify-start u-row-bottom-40 u-overflow-hidden u-items-stretch">' +
        '<div class="layout-box justify-start u-row-bottom-40 VVzx5u u-width-quarter u-margin-bottom-neg-200 u-pad-block-200 u-flex-wrap u-pad-inline-100 flex-row-container" style="height:100%;width:100%">' +
        '<div class="flex-row spacing-inline-zero spacing-block-zero justify-start flex-column items-center" style="width:94px">' +
        '<div class="layout-box u-margin-bottom-200">' +
        '<div class="layout-box u-pad-inline-300 u-margin-bottom-100 justify-center flex-row-container">' +
        '<div data-test-id="copy-link-share-icon" class="layout-box" style="cursor:pointer;height:64px">' +
        '<button aria-label="프로필 링크를 클립보드에 복사하세요." class="button-reset" tabindex="0" type="button">' +
        '<div class="button-reset-inner interactive-scale cursor-pointer-inner">' +
        '<div class="icon-container u-rounded-500 icon-surface-secondary" style="height:64px;width:64px">' +
        '<svg aria-hidden="true" class="u-flip-rtl icon-svg display-block icon-color-default" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M19.83 2.41a4 4 0 0 0-5.66 0l-2.26 2.26a4 4 0 0 0-.48 5.07l1.47-1.47a2 2 0 0 1 .43-2.18l2.26-2.26a2 2 0 0 1 2.82 0l1.76 1.76a2 2 0 0 1 0 2.82l-2.26 2.26a2 2 0 0 1-2.18.43l-1.47 1.47a4 4 0 0 0 5.07-.48l2.26-2.26a4 4 0 0 0 0-5.66zM2.4 14.17a4 4 0 0 0 0 5.66l1.76 1.76a4 4 0 0 0 5.66 0l2.26-2.26a4 4 0 0 0 .48-5.07l-1.47 1.47a2 2 0 0 1-.43 2.18L8.4 20.17a2 2 0 0 1-2.82 0l-1.76-1.76a2 2 0 0 1 0-2.82l2.26-2.26a2 2 0 0 1 2.18-.43l1.47-1.47a4 4 0 0 0-5.07.48zm6.3 2.54 8-8-1.42-1.42-8 8z"></path></svg>' +
        '</div>' +
        '</div>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<div class="text-default text-center text-break-word text-with-inline-icon text-antialiased text-body-100-leading text-body-100 text-body-100-regular">링크 복사</div>' +
        '</div>' +
        '</div>' +
        '<div class="flex-row spacing-inline-zero spacing-block-zero justify-start flex-column items-center" style="width:94px">' +
        '<div class="layout-box u-margin-bottom-200">' +
        '<div class="layout-box u-pad-inline-300 u-margin-bottom-100 justify-center flex-row-container">' +
        '<a aria-label="이메일로 공유" class="link-reset text-color-inherit text-no-underline interactive-scale button-reset-inner cursor-pointer-inner" href="#" tabindex="0">' +
        '<div class="icon-container u-rounded-500 icon-surface-secondary" style="height:64px;width:64px">' +
        '<svg aria-hidden="true" class="icon-svg display-block icon-color-default" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M0 7a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4zm2 0c0 .25.14.48.36.6L12 12.86l9.64-5.26A.7.7 0 0 0 22 7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2m10 8.14L2 9.68V17c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V9.68z"></path></svg>' +
        '</div>' +
        '</a>' +
        '</div>' +
        '<div class="text-default text-center text-break-word text-with-inline-icon text-antialiased text-body-100-leading text-body-100 text-body-100-regular">이메일</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="layout-box" style="height:32px"></div>' +
        '</div>' +
        '</div>';
  }

  function buildNewMessageHTML() {
    return '<div class="layout-box" style="padding-right:12px">' +
        '<div class="layout-box u-pad-inline-200 u-pad-block-200 items-center flex-row-container">' +
        '<div class="layout-box u-margin-inline-end-100">' +
        '<button aria-label="받은 편지함으로 돌아가기" class="button-reset" tabindex="0" type="button">' +
        '<div class="button-reset-inner interactive-scale cursor-pointer-inner">' +
        '<div class="icon-container rounded-400-surface icon-surface-transparent" style="height:48px;width:48px">' +
        '<svg aria-hidden="true" class="u-flip-rtl icon-svg display-block icon-color-default" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="m6.41 12 10.3-10.3L15.29.3 3.6 12l11.7 11.7 1.42-1.4z"></path></svg>' +
        '</div>' +
        '</div>' +
        '</button>' +
        '</div>' +
        '<div class="flex-row spacing-inline-zero spacing-block-zero justify-start u-row-bottom-40 u-items-stretch flex-grow">' +
        '<h2 class="heading-margin-reset text-antialiased text-default heading-400 heading-align-start heading-break-word">새 메시지</h2>' +
        '</div>' +
        '<div id="new-message-next-button" tabindex="0" class="layout-box">' +
        '<button class="u-floating-border-shell cursor-pointer interactive-scale u-pill-button-shell u-disabled-surface u-inline-block" disabled type="button">' +
        '<div class="u-center-flex-wrap">' +
        '<div class="text-disabled text-center ui-antialiased text-ui-200 text-ui-200-leading">다음</div>' +
        '</div>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<section aria-label="수신자 검색 또는 선택" class="layout-box u-pad-inline-200 u-pad-block-200">' +
        '<div class="layout-box iWgz2P u-visually-hidden">' +
        '<div class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-regular">메시지 수신자를 선택하는 대화 상자가 표시됩니다. 검색 필드를 사용하여 이름이나 이메일로 연락처를 찾거나 추천 연락처 목록에서 선택합니다.</div>' +
        '</div>' +
        '<div class="layout-box u-margin-bottom-200 u-pad-inline-200">' +
        '<div>' +
        '<div class="isolate-layer">' +
        '<div aria-hidden="true" class="input-icon-leading-shell input-icon-position-start">' +
        '<div>' +
        '<svg aria-hidden="true" class="icon-svg display-block icon-color-default" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="M17.33 18.74a10 10 0 1 1 1.41-1.41l4.47 4.47-1.41 1.41zM11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16"></path></svg>' +
        '</div>' +
        '</div>' +
        '<input aria-label="검색 필드" autocomplete="off" class="input-shell-block text-ellipsis text-clamp-box bg-default-surface text-default-color input-border-interactive input-control-surface text-body-300 text-body-300-regular input-pad-block-large input-pad-inline-start-icon input-pad-inline-end" enterkeyhint="search" id="contactSearch" placeholder="이름 또는 이메일 검색" type="search" value="">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="layout-box u-margin-bottom-200 u-pad-block-200 u-scroll-y" style="height:calc(100vh - 222px)">' +
        '<div class="layout-box section-padding-x-400 u-pad-block-300">' +
        '<h3 class="heading-margin-reset text-antialiased text-default heading-300 heading-align-start heading-break-word"><span class="text-default text-align-start text-break-word text-with-inline-icon text-antialiased text-body-300 text-body-300-regular">추천</span></h3>' +
        '<div aria-atomic="true" aria-live="assertive" class="layout-box iWgz2P u-visually-hidden">1개 검색 결과가 있습니다.</div>' +
        '</div>' +
        '<div aria-checked="false" aria-disabled="false" class="interactive-scale u-rounded-none u-focus-ring width-full cursor-pointer new-msg-contact" role="checkbox" tabindex="0">' +
        '<div class="layout-box surface-default u-pad-inline-200 rounded-400 u-pad-block-200 items-center flex-row-container">' +
        '<div class="layout-box u-margin-inline-200 spacing-inline-end-200">' +
        '<div class="avatar-frame avatar-size-48" data-test-id="gestalt-avatar-svg">' +
        '<div class="overflow-hidden-relative rounded-circle will-change-transform">' +
        '<div>' +
        '<div class="layout-box position-relative" style="background-color:var(--hover-bg);padding-bottom:100%">' +
        '<img alt=" " class="profile-avatar-image" draggable="true" fetchpriority="auto" loading="auto" src="' + createAvatarDataUri('정찬호', 23) + '">' +
        '</div>' +
        '</div>' +
        '<div class="avatar-overlay"></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="flex-row u-inline-gap-50 u-stack-gap-50 flex-column justify-center flex-grow">' +
        '<div class="slot-block">' +
        '<div class="text-default text-align-start text-break-word text-clamp-box text-with-inline-icon text-antialiased text-body-300 text-body-300-strong" title="정찬호" style="-webkit-line-clamp:1">정찬호</div>' +
        '</div>' +
        '<div class="slot-block">' +
        '<div class="text-default text-align-start text-break-word text-clamp-box text-with-inline-icon text-antialiased text-body-300 text-body-300-regular" title="@chanho8629" style="-webkit-line-clamp:1">@chanho8629</div>' +
        '</div>' +
        '</div>' +
        '<div class="layout-box" style="width:24px"></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</section>';
  }

  function bindInviteEvents(panel) {
    const chatContainer = panel.querySelector('#full-height-inbox-panel > div');
    if (!chatContainer) return;

    const closeBtn = chatContainer.querySelector('.invite-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        panel.remove();
        resetAllNavIcons();
      });
    }

    const copyBtn = chatContainer.querySelector('[data-test-id="copy-link-share-icon"] button');
    if (copyBtn) {
      copyBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        const profileUrl = window.location.origin + '/profile';
        navigator.clipboard.writeText(profileUrl).catch(function () {
        });
        showToast('클립보드에 공유할 링크를 복사했습니다');
      });
    }

    const emailBtn = chatContainer.querySelector('[aria-label="이메일로 공유"]');
    if (emailBtn) {
      emailBtn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        showEmailInviteModal();
      });
    }
  }

  function bindNewMessageEvents(container, panel, btn) {
    const backBtn = container.querySelector('[aria-label="받은 편지함으로 돌아가기"]');
    if (backBtn) {
      backBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        panel.remove();
        resetAllNavIcons();
        btn.click();
      });
    }

    const contactItem = container.querySelector('.new-msg-contact');
    const nextBtn = container.querySelector('#new-message-next-button button');
    const contactInner = contactItem ? contactItem.querySelector('.rounded-400') : null;
    if (contactItem && contactInner) {
      contactItem.addEventListener('mouseenter', function () {
        contactInner.classList.add('u-bg-secondary');
      });
      contactItem.addEventListener('mouseleave', function () {
        contactInner.classList.remove('u-bg-secondary');
      });
      contactItem.style.cursor = 'pointer';
    }

    const checkArea = contactItem.querySelector('div[style="width:24px"]');
    if (contactItem && nextBtn) {
      contactItem.addEventListener('click', function () {
        const isChecked = this.getAttribute('aria-checked') === 'true';
        this.setAttribute('aria-checked', String(!isChecked));
        if (!isChecked) {
          if (checkArea) {
            checkArea.innerHTML = '<svg aria-hidden="true" class="icon-svg display-block icon-color-neutral" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg>';
          }
          nextBtn.disabled = false;
          nextBtn.classList.remove('u-disabled-surface');
          nextBtn.style.backgroundColor = 'var(--primary-color)';
          nextBtn.style.cursor = 'pointer';
          nextBtn.style.pointerEvents = 'auto';
          nextBtn.querySelector('.text-disabled').style.color = '#111';
        } else {
          if (checkArea) checkArea.innerHTML = '';
          nextBtn.disabled = true;
          nextBtn.classList.add('u-disabled-surface');
          nextBtn.style.backgroundColor = '';
          nextBtn.style.cursor = '';
          nextBtn.style.pointerEvents = '';
          nextBtn.querySelector('.text-disabled').style.color = '';
        }
      });
    }

    const searchInput = container.querySelector('#contactSearch');
    if (searchInput) searchInput.focus();
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

      panel.querySelector('[aria-label="닫기"]').addEventListener('click', function (e) {
        e.stopPropagation();
        panel.remove();
        resetAllNavIcons();
      });

      // ── 친구 초대하기 클릭 → 초대 패널로 전환 ──
      const inviteBtn = panel.querySelector('[data-test-id="invite-friends-cta"]');
      if (inviteBtn) {
        inviteBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          const chatContainer = panel.querySelector('#full-height-inbox-panel > div');
          if (!chatContainer) return;
          chatContainer.innerHTML = buildInviteFriendsHTML();
          bindInviteEvents(panel);
        });
      }

      // ── 새 메시지 버튼 클릭 → 새 메시지 작성 패널로 전환 ──
      const newMsgBtn = panel.querySelector('[data-test-id="compose-new-message-button"]');
      if (newMsgBtn) {
        newMsgBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          const container = panel.querySelector('[data-test-id="full-height-inbox-container"]');
          if (!container) return;
          container.innerHTML = buildNewMessageHTML();
          bindNewMessageEvents(container, panel, btn);
        });
      }
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

  // ===== [최종 작업] 통일된 상세 페이지 전환 및 복구 로직 (Pinterest 스타일) =====
  (function () {
    // 공통 헤더 템플릿 헬퍼
    function getHeaderHTML(title, isChat = false, avatar = '') {
      const avatarImg = isChat ? `<img src="${avatar}" style="width:32px; height:32px; border-radius:50%; margin-right:8px;">` : '';
      return `
        <div class="side-panel__header" style="padding: 16px; border-bottom:1px solid #efefef; display:flex; align-items:center; gap:12px;">
          <button class="chat-back-btn button-reset icon-container rounded-circle" style="width:32px; height:32px;">
            <svg height="20" viewBox="0 0 24 24" width="20"><path d="m6.41 12 10.3-10.3L15.29.3 3.6 12l11.7 11.7 1.42-1.4z"></path></svg>
          </button>
          <div style="display:flex; align-items:center; flex:1; overflow:hidden;">
            ${avatarImg}
            <span style="font-weight:700; font-size:16px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${title}</span>
          </div>
          <button class="side-panel__close button-reset icon-container rounded-circle" style="width:32px; height:32px;">
            <svg height="16" viewBox="0 0 24 24" width="16"><path d="m12 13.41 8.3 8.3 1.4-1.42L13.42 12l8.3-8.3-1.42-1.4-8.3 8.28-8.3-8.3L2.3 3.7l8.28 8.3-8.3 8.3 1.42 1.4z"></path></svg>
          </button>
        </div>
      `;
    }

    // 템플릿에서 콘텐츠만 추출
    function getInnerContent(htmlString) {
      const temp = document.createElement('div');
      temp.innerHTML = htmlString;
      const sidePanel = temp.querySelector('.side-panel');
      return sidePanel ? sidePanel.innerHTML : temp.innerHTML;
    }

    document.addEventListener('click', function (e) {
      const panel = e.target.closest('.side-panel');
      if (!panel) return;

      // 메시지 아이템 클릭 → 상세 대화방
      const msgItem = e.target.closest('[data-test-id="conversation-list-item"]');
      if (msgItem) {
        const name = msgItem.querySelector('.side-panel__msg-name').textContent;
        const avatar = msgItem.querySelector('.side-panel__msg-avatar').src;
        panel.innerHTML = `
          ${getHeaderHTML(name, true, avatar)}
          <div class="side-panel__body" style="padding:16px; flex:1; display:flex; flex-direction:column; gap:16px; background:#fff;">
            <div style="display:flex; gap:8px; align-items:flex-end;">
              <img src="${avatar}" style="width:24px; height:24px; border-radius:50%; margin-bottom:4px;">
              <div style="background:#efefef; padding:12px 16px; border-radius:18px; max-width:75%; font-size:14px; color:#111; line-height:1.4;">안녕하세요! 작품 잘 봤습니다.</div>
            </div>
            <div style="align-self:flex-end; background:#111; color:#fff; padding:12px 16px; border-radius:18px; max-width:75%; font-size:14px; line-height:1.4;">감사합니다! 혹시 어떤 스타일을 선호하시나요?</div>
          </div>
          <div style="padding:16px; border-top:1px solid #efefef; background:#fff;">
            <div style="display:flex; align-items:center; background:#efefef; border-radius:24px; padding:4px 4px 4px 16px; gap:8px">
              <input type="text" placeholder="메시지 보내기" style="border:none; background:transparent; flex:1; outline:none; font-size:16px; padding:8px 0;">
              <button class="button-reset chat-send-btn icon-container" style="width:40px; height:40px;">
                <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
              </button>
            </div>
          </div>
        `;
        return;
      }

      // 친구 초대하기 클릭 → 초대 페이지
      const inviteBtn = e.target.closest('[data-test-id="invite-friends-cta"]');
      if (inviteBtn) {
        panel.innerHTML = `
          ${getHeaderHTML('친구 초대하기')}
          <div class="side-panel__body" style="padding: 32px 16px; text-align:center;">
            <div style="width:80px; height:80px; background:#f0d999; border-radius:50%; margin:0 auto 16px; display:flex; align-items:center; justify-content:center;"><svg height="40" viewBox="0 0 24 24" width="40" style="color:#111"><path d="M12 11a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M8.5 5.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0M3 23h9v-2H4.06a8 8 0 0 1 11.05-6.37l.78-1.85A10 10 0 0 0 2 22a1 1 0 0 0 1 1m17-3h4v-2h-4v-4h-2v4h-4v2h4v4h2z"></path></svg></div>
            <h3 style="font-size:20px; font-weight:700;">친구들과 함께하세요</h3>
            <p style="color:#767676; font-size:14px; margin-bottom:32px;">프로필 링크를 공유하고 채팅을 시작해보세요.</p>
            <button onclick="navigator.clipboard.writeText(window.location.origin); showToast('복사되었습니다!')" style="width:100%; padding:14px; border:none; border-radius:24px; background:#f0d999; font-weight:700; cursor:pointer; color:#111;">링크 복사</button>
          </div>
        `;
        return;
      }

      // 새 메시지 작성(검색바) 클릭 → 검색 페이지
      const composeBtn = e.target.closest('[data-test-id="compose-new-message-button"]');
      if (composeBtn) {
        panel.innerHTML = `
          ${getHeaderHTML('새 메시지')}
          <div class="side-panel__body" style="padding: 16px;">
            <div style="background:#efefef; border-radius:24px; padding:10px 16px; display:flex; align-items:center; gap:12px; margin-bottom:24px;">
              <svg height="16" viewBox="0 0 24 24" width="16" style="color:#767676"><path d="M17.33 18.74a10 10 0 1 1 1.41-1.41l4.47 4.47-1.41 1.41zM11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16"></path></svg>
              <input type="text" id="contactSearch" placeholder="이름 또는 이메일 검색" style="border:none; background:transparent; flex:1; outline:none; font-size:16px;">
            </div>
            <div style="text-align:center; padding-top:40px;">
              <p style="color:#767676; font-size:14px;">검색 결과가 없습니다.</p>
            </div>
          </div>
        `;
        /*
        // 검색 결과 있는 버전 (Pinterest 스타일)
        panel.innerHTML = `
          ${getHeaderHTML('새 메시지')}
          <div class="side-panel__body" style="padding: 16px;">
            <div style="background:#efefef; border-radius:24px; padding:10px 16px; display:flex; align-items:center; gap:12px; margin-bottom:24px;">
              <svg height="16" viewBox="0 0 24 24" width="16" style="color:#767676"><path d="M17.33 18.74a10 10 0 1 1 1.41-1.41l4.47 4.47-1.41 1.41zM11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16"></path></svg>
              <input type="text" id="contactSearch" placeholder="이름 또는 이메일 검색" style="border:none; background:transparent; flex:1; outline:none; font-size:16px;">
            </div>

            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="padding: 8px 12px; font-size:14px; font-weight:600; color:#111;">추천</div>

              <!-- 유저 1 -->
              <div style="display:flex; align-items:center; gap:12px; padding:8px; border-radius:8px; cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='#efefef'" onmouseout="this.style.background='transparent'">
                <img src="https://i.pinimg.com/736x/ea/1f/64/ea1f64668a0af149a3277db9e9e54824.jpg" style="width:48px; height:48px; border-radius:50%; object-fit:cover;">
                <div style="flex:1;">
                  <div style="font-weight:600; font-size:16px; color:#111;">이동혁</div>
                  <div style="font-size:14px; color:#767676;">@hyuck_lee</div>
                </div>
              </div>

              <!-- 유저 2 (이미지 없음, 이니셜) -->
              <div style="display:flex; align-items:center; gap:12px; padding:8px; border-radius:8px; cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='#efefef'" onmouseout="this.style.background='transparent'">
                <div style="width:48px; height:48px; border-radius:50%; background:#e60023; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:20px;">K</div>
                <div style="flex:1;">
                  <div style="font-weight:600; font-size:16px; color:#111;">Kang Daniel</div>
                  <div style="font-size:14px; color:#767676;">@daniel_k</div>
                </div>
              </div>

               <!-- 유저 3 -->
               <div style="display:flex; align-items:center; gap:12px; padding:8px; border-radius:8px; cursor:pointer; transition: background 0.2s;" onmouseover="this.style.background='#efefef'" onmouseout="this.style.background='transparent'">
                <img src="https://i.pinimg.com/236x/36/57/46/36574620027376a88b50201201460394.jpg" style="width:48px; height:48px; border-radius:50%; object-fit:cover;">
                <div style="flex:1;">
                  <div style="font-weight:600; font-size:16px; color:#111;">Jenny Kim</div>
                  <div style="font-size:14px; color:#767676;">@jennny_k</div>
                </div>
              </div>

            </div>
          </div>
        `;
        */
        setTimeout(() => document.getElementById('contactSearch')?.focus(), 100);
        return;
      }

      // 뒤로 가기 버튼 클릭 → 목록 복구
      const backBtn = e.target.closest('.chat-back-btn');
      if (backBtn) {
        panel.innerHTML = getInnerContent(buildMessageListHTML());
        return;
      }

      // 닫기 버튼 클릭 (전역 닫기)
      const closeBtn = e.target.closest('.side-panel__close');
      if (closeBtn) {
        panel.remove();
        resetAllNavIcons();
        return;
      }
    }, true); //
  })();
});

