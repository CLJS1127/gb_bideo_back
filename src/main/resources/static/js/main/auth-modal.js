// ─── 인증 모달 (로그인) ─────────────────────────
// SVG 상수는 modal-shared.js에서 로드 (MODAL_SVG_EYE_OPEN, MODAL_SVG_EYE_CLOSED, MODAL_GOOGLE_ICON_SVG, MODAL_NAVER_ICON_SVG, MODAL_KAKAO_ICON_SVG)  

function buildLoginViewHTML() {
  return '' +
    '<div class="auth-modal__login-view">' +
      '<div class="auth-modal__inner">' +
        '<div class="auth-modal__content-row">' +
          '<div class="auth-modal__form-side">' +
            '<div class="auth-modal__logo">' +
              '<img src="../../static/images/BIDEO_LOGO/BIDEO_favicon.png" alt="BIDEO" width="40" height="40">' +
            '</div>' +
            '<h2 class="auth-modal__form-title">BIDEO에 오신 것을 환영합니다</h2>' +
            '<form onsubmit="event.preventDefault()">' +
              '<div class="auth-modal__form-group">' +
                '<label class="auth-modal__form-label">아이디</label>' +
                '<div class="auth-modal__input-wrapper">' +
                  '<input type="email" class="auth-modal__input" placeholder="아이디" autocomplete="off">' +
                '</div>' +
              '</div>' +
              '<div class="auth-modal__form-group">' +
                '<label class="auth-modal__form-label">비밀번호</label>' +
                '<div class="auth-modal__input-wrapper">' +
                  '<input type="password" class="auth-modal__input" placeholder="비밀번호" id="authLoginPassword" autocomplete="off">' +
                  '<button type="button" class="auth-modal__password-toggle" onclick="togglePasswordVisibility(\'authLoginPassword\', \'authLoginEye\')">' +
                    '<svg viewBox="0 0 24 24" id="authLoginEye">' + MODAL_SVG_EYE_OPEN + '</svg>' +
                  '</button>' +
                '</div>' +
              '</div>' +
              '<div class="auth-modal__helper-links">' +
                '<a href="#" class="auth-modal__forgot-link" onclick="showAuthFindIdView()">아이디 찾기</a>' +
                '<a href="#" class="auth-modal__forgot-link" onclick="showAuthFindPasswordView()">비밀번호 찾기</a>' +
              '</div>' +
              '<button type="submit" class="auth-modal__submit-btn">로그인</button>' +
            '</form>' +
            '<div class="auth-modal__social-login">' +
              '<div class="auth-modal__social-login-left">' +
                '<div class="auth-modal__social-name">Google로 계속</div>' +
              '</div>' +
              MODAL_GOOGLE_ICON_SVG +
            '</div>' +
            '<div class="auth-modal__social-login auth-modal__social-login--naver">' +
              '<div class="auth-modal__social-login-left">' +
                '<div class="auth-modal__social-name">Naver로 계속</div>' +
              '</div>' +
              MODAL_NAVER_ICON_SVG +
            '</div>' +
            '<div class="auth-modal__social-login auth-modal__social-login--kakao">' +
              '<div class="auth-modal__social-login-left">' +
                '<div class="auth-modal__social-name">Kakao로 계속</div>' +
              '</div>' +
              MODAL_KAKAO_ICON_SVG +
            '</div>' +
            '<div class="auth-modal__divider-text" style="margin-top:14px">' +
              '아직 BIDEO를 사용하고 있지 않으신가요? <a href="#" class="auth-modal__bold-link" onclick="closeAuthModal(); showSignupModal();">가입하기</a>' +
            '</div>' +
            '<div class="auth-modal__terms-text">' +
              '계속하면 BIDEO의 <a href="#" onclick="event.preventDefault(); showLegalModal(\'terms\')">서비스 약관</a>에 동의하고 <a href="#" onclick="event.preventDefault(); showLegalModal(\'privacy\')">개인정보 보호정책</a>을 읽었음을 인정한 것으로 간주합니다.' +
            '</div>' +
          '</div>' +
            '<img class="auth-modal__qr-image" src="../../static/images/BIDEO_LOGO/BIDEO.png" alt="BIDEO">' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function buildFindIdViewHTML() {
  return '' +
    '<div class="auth-modal__subview">' +
      '<div class="auth-modal__subview-inner">' +
        '<div class="auth-modal__logo">' +
          '<img src="../../static/images/BIDEO_LOGO/BIDEO_favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="auth-modal__form-title">아이디 찾기</h2>' +
        '<p class="auth-modal__subcopy">가입에 사용한 이메일을 입력하세요.</p>' +
        '<form onsubmit="event.preventDefault(); showAuthFindIdResultView();">' +
          '<div class="auth-modal__form-group">' +
            '<label class="auth-modal__form-label">이메일</label>' +
            '<div class="auth-modal__input-wrapper">' +
              '<input type="text" class="auth-modal__input" placeholder="이메일을 입력하세요" autocomplete="off">' +
            '</div>' +
          '</div>' +
          '<button type="submit" class="auth-modal__submit-btn">아이디 찾기</button>' +
        '</form>' +
        '<button type="button" class="auth-modal__text-btn" onclick="showAuthLoginView()">로그인으로 돌아가기</button>' +
      '</div>' +
    '</div>';
}

function buildFindIdResultViewHTML() {
  return '' +
    '<div class="auth-modal__subview">' +
      '<div class="auth-modal__subview-inner">' +
        '<div class="auth-modal__logo">' +
          '<img src="../../static/images/BIDEO_LOGO/BIDEO_favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="auth-modal__form-title">아이디 찾기 완료</h2>' +
        '<p class="auth-modal__subcopy">입력한 이메일로 아이디 안내를 보냈습니다.</p>' +
        '<button type="button" class="auth-modal__submit-btn" onclick="showAuthLoginView()">로그인으로 이동</button>' +
      '</div>' +
    '</div>';
}

function buildFindPasswordViewHTML() {
  return '' +
    '<div class="auth-modal__subview">' +
      '<div class="auth-modal__subview-inner">' +
        '<div class="auth-modal__logo">' +
          '<img src="../../static/images/BIDEO_LOGO/BIDEO_favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="auth-modal__form-title">비밀번호 찾기</h2>' +
        '<p class="auth-modal__subcopy">아이디와 이메일을 입력하면 비밀번호 변경 화면으로 이동합니다.</p>' +
        '<form onsubmit="event.preventDefault(); showAuthResetPasswordView();">' +
          '<div class="auth-modal__form-group">' +
            '<label class="auth-modal__form-label">아이디</label>' +
            '<div class="auth-modal__input-wrapper">' +
              '<input type="text" class="auth-modal__input" placeholder="아이디를 입력하세요" autocomplete="off">' +
            '</div>' +
          '</div>' +
          '<div class="auth-modal__form-group">' +
            '<label class="auth-modal__form-label">이메일</label>' +
            '<div class="auth-modal__input-wrapper">' +
              '<input type="text" class="auth-modal__input" placeholder="이메일을 입력하세요" autocomplete="off">' +
            '</div>' +
          '</div>' +
          '<button type="submit" class="auth-modal__submit-btn">비밀번호 찾기</button>' +
        '</form>' +
        '<button type="button" class="auth-modal__text-btn" onclick="showAuthLoginView()">로그인으로 돌아가기</button>' +
      '</div>' +
    '</div>';
}

function buildResetPasswordViewHTML() {
  return '' +
    '<div class="auth-modal__subview">' +
      '<div class="auth-modal__subview-inner">' +
        '<div class="auth-modal__logo">' +
          '<img src="../../static/images/BIDEO_LOGO/BIDEO_favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="auth-modal__form-title">비밀번호 변경</h2>' +
        '<p class="auth-modal__subcopy">새 비밀번호를 입력하고 변경을 완료하세요.</p>' +
        '<form onsubmit="event.preventDefault(); showAuthResetPasswordCompleteView();">' +
          '<div class="auth-modal__form-group">' +
            '<label class="auth-modal__form-label">새 비밀번호</label>' +
            '<div class="auth-modal__input-wrapper">' +
              '<input type="password" class="auth-modal__input" placeholder="새 비밀번호를 입력하세요" id="authResetPassword" autocomplete="off">' +
              '<button type="button" class="auth-modal__password-toggle" onclick="togglePasswordVisibility(\'authResetPassword\', \'authResetEye\')">' +
                '<svg viewBox="0 0 24 24" id="authResetEye">' + MODAL_SVG_EYE_OPEN + '</svg>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="auth-modal__form-group">' +
            '<label class="auth-modal__form-label">새 비밀번호 확인</label>' +
            '<div class="auth-modal__input-wrapper">' +
              '<input type="password" class="auth-modal__input" placeholder="비밀번호를 다시 입력하세요" id="authResetPasswordConfirm" autocomplete="off">' +
              '<button type="button" class="auth-modal__password-toggle" onclick="togglePasswordVisibility(\'authResetPasswordConfirm\', \'authResetConfirmEye\')">' +
                '<svg viewBox="0 0 24 24" id="authResetConfirmEye">' + MODAL_SVG_EYE_OPEN + '</svg>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<button type="submit" class="auth-modal__submit-btn">비밀번호 변경</button>' +
        '</form>' +
      '</div>' +
    '</div>';
}

function buildResetPasswordCompleteViewHTML() {
  return '' +
    '<div class="auth-modal__subview">' +
      '<div class="auth-modal__subview-inner">' +
        '<div class="auth-modal__logo">' +
          '<img src="../../static/images/BIDEO_LOGO/BIDEO_favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="auth-modal__form-title">비밀번호 변경 완료</h2>' +
        '<p class="auth-modal__subcopy">새 비밀번호로 다시 로그인할 수 있습니다.</p>' +
        '<button type="button" class="auth-modal__submit-btn" onclick="showAuthLoginView()">로그인으로 이동</button>' +
      '</div>' +
    '</div>';
}

function renderAuthModalView(viewHTML) {
  const overlay = document.getElementById('authModal');
  if (!overlay) return;

  const dialog = overlay.querySelector('.auth-modal__dialog');
  if (!dialog) return;

  dialog.innerHTML =
    '<button class="auth-modal__close-btn" aria-label="닫기">' +
      '<svg viewBox="0 0 24 24"><path d="M15.18 12l7.16-7.16a2.25 2.25 0 10-3.18-3.18L12 8.82 4.84 1.66a2.25 2.25 0 10-3.18 3.18L8.82 12l-7.16 7.16a2.25 2.25 0 103.18 3.18L12 15.18l7.16 7.16a2.25 2.25 0 103.18-3.18z" fill="#111"/></svg>' +
    '</button>' +
    viewHTML;

  dialog.querySelector('.auth-modal__close-btn').addEventListener('click', closeAuthModal);
}

function showAuthLoginView() {
  renderAuthModalView(buildLoginViewHTML());
}

function showAuthFindIdView() {
  renderAuthModalView(buildFindIdViewHTML());
}

function showAuthFindIdResultView() {
  renderAuthModalView(buildFindIdResultViewHTML());
}

function showAuthFindPasswordView() {
  renderAuthModalView(buildFindPasswordViewHTML());
}

function showAuthResetPasswordView() {
  renderAuthModalView(buildResetPasswordViewHTML());
}

function showAuthResetPasswordCompleteView() {
  renderAuthModalView(buildResetPasswordCompleteViewHTML());
}

function showAuthModal() {
  if (document.getElementById('authModal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'authModal';
  overlay.className = 'auth-modal';

  overlay.innerHTML =
    '<div class="auth-modal__backdrop"></div>' +
    '<div class="auth-modal__dialog">' +
      '<button class="auth-modal__close-btn" aria-label="닫기">' +
        '<svg viewBox="0 0 24 24"><path d="M15.18 12l7.16-7.16a2.25 2.25 0 10-3.18-3.18L12 8.82 4.84 1.66a2.25 2.25 0 10-3.18 3.18L8.82 12l-7.16 7.16a2.25 2.25 0 103.18 3.18L12 15.18l7.16 7.16a2.25 2.25 0 103.18-3.18z" fill="#111"/></svg>' +
      '</button>' +
      buildLoginViewHTML() +
    '</div>';

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // 애니메이션
  requestAnimationFrame(function() { overlay.classList.add('auth-modal--open'); });

  // 이벤트 바인딩
  overlay.querySelector('.auth-modal__backdrop').addEventListener('click', closeAuthModal);
  overlay.querySelector('.auth-modal__close-btn').addEventListener('click', closeAuthModal);

  // ESC 닫기
  overlay._escHandler = function(e) {
    if (e.key === 'Escape') closeAuthModal();
  };
  document.addEventListener('keydown', overlay._escHandler);
}

function closeAuthModal() {
  const overlay = document.getElementById('authModal');
  if (!overlay) return;

  overlay.classList.remove('auth-modal--open');
  document.body.style.overflow = '';

  if (overlay._escHandler) {
    document.removeEventListener('keydown', overlay._escHandler);
  }

  setTimeout(function() { overlay.remove(); }, 250);
}
