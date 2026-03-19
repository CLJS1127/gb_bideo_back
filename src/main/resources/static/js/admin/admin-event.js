// admin-event.js - 이벤트 리스너 및 사용자 인터랙션 처리


document.addEventListener('DOMContentLoaded', () => {
    if (typeof BIDEO_LAYOUT !== 'undefined') {
        BIDEO_LAYOUT.initIcons();
    }

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('show');
    });

    // 전역 클릭 이벤트 위임
    document.addEventListener('click', (e) => {
        const target = e.target;

        // LNB 및 네비게이션 처리
        const navItem = target.closest('.nav-item');
        if (navItem) {
            const group = navItem.closest('.nav-group');
            const hasSubmenu = !!group?.querySelector('.nav-submenu');
            if (hasSubmenu) {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                navItem.classList.add('active');
                const targetSubmenu = group.querySelector('.nav-submenu');
                document.querySelectorAll('.nav-submenu').forEach(sm => {
                    if (sm !== targetSubmenu) sm.classList.remove('show');
                });
                targetSubmenu.classList.toggle('show');
                return;
            }
        }

        const subItem = target.closest('.nav-sub-item');
        if (subItem && typeof BIDEO_LAYOUT !== 'undefined') {
            BIDEO_LAYOUT.updateHeader(subItem.textContent.trim());
            return;
        }

        // UI 컨트롤 (필터, 검색, 셀렉트)
        const filterBtn = target.closest('.btn-filter');
        if (filterBtn) {
            filterBtn.parentElement.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            filterBtn.classList.add('active');
            return;
        }

        const selectTrigger = target.closest('.custom-select-trigger');
        if (selectTrigger) {
            selectTrigger.closest('.custom-select-wrapper')?.classList.toggle('open');
            return;
        }

        const option = target.closest('.custom-option');
        if (option) {
            const wrapper = option.closest('.custom-select-wrapper');
            const triggerText = wrapper?.querySelector('.selected-text');
            const hiddenInput = wrapper?.querySelector('input[type="hidden"]');
            if (triggerText) triggerText.textContent = option.textContent.trim();
            if (hiddenInput) hiddenInput.value = option.getAttribute('data-value') || '';
            wrapper?.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            wrapper?.classList.remove('open');
            return;
        }

        if (!target.closest('.custom-select-wrapper')) {
            document.querySelectorAll('.custom-select-wrapper.open').forEach(w => w.classList.remove('open'));
        }

        // 모달 제어 (오픈/닫기)
        if (target.closest('#btn-add-curator')) { openCuratorModal('registration'); return; }
        if (target.closest('.btn-edit-curator')) { openCuratorModal('edit'); return; }
        if (target.closest('.btn-edit-block')) { openBlockModal(); return; }
        if (target.closest('.btn-detail-block')) { openBlockDetailModal(); return; }
        
        if (target.closest('.modal-close') || target.classList.contains('modal-overlay')) {
            closeCuratorModal();
            closeBlockModal();
            closeBlockDetailModal();
            closeConfirmModal();
            closeImageModal();
            return;
        }

        // 문의 답변 등록 버튼 (특수 로직)
        const submitAnswerBtn = target.closest('#btn-submit-answer');
        if (submitAnswerBtn) {
            const content = document.getElementById('answer-content')?.value.trim();
            if (!content) { 
                if (typeof BIDEO_LAYOUT !== 'undefined') BIDEO_LAYOUT.showSnackbar('답변 내용을 입력해주세요.', 'error');
                return; 
            }
            const executeSend = () => {
                submitAnswerBtn.disabled = true;
                submitAnswerBtn.textContent = '발송 중...';
                if (typeof BIDEO_SERVICE !== 'undefined') {
                    BIDEO_SERVICE.sendInquiryAnswer('ID', content).then(res => {
                        if (typeof BIDEO_LAYOUT !== 'undefined') BIDEO_LAYOUT.showSnackbar(res.message, 'success');
                        setTimeout(() => location.href = 'admin-inquiry-list.html', 1200);
                    });
                }
            };
            openConfirmModal('답변 발송 확인', '작성하신 답변을 고객에게 이메일로 발송하시겠습니까?', executeSend);
            return;
        }

        // 큐레이터 저장 버튼 (특수 로직)
        const actionBtn = target.closest('.dynamic-btn, .btn-success, .btn-danger, .btn-primary, .btn-secondary');
        const isExcluded = !actionBtn || actionBtn.closest('.list-controls') || actionBtn.closest('.nav-group') || actionBtn.closest('.search-wrapper');
        
        if (actionBtn && !isExcluded) {
            const btnText = actionBtn.textContent.trim();
            
            const isDanger = btnText.includes('삭제') || btnText.includes('중단') || btnText.includes('취소') || 
                             btnText.includes('반려') || btnText.includes('거부') || btnText.includes('경매 종료') ||
                             btnText.includes('차단 해제') || btnText.includes('해제');
            
            const isApprove = btnText.includes('승인') || btnText.includes('확인') || btnText.includes('전시') || 
                              btnText.includes('다시 노출') || btnText.includes('적용');
            const isSave = btnText.includes('저장') || btnText.includes('등록') || btnText.includes('수정') || btnText.includes('임시 저장');

            let message = '';
            let type = 'success';

            if (isDanger) {
                message = '처리가 완료되었습니다.';
                type = 'error';
            } else if (isApprove) {
                message = '정상적으로 처리되었습니다.';
                type = 'success';
            } else if (isSave) {
                message = btnText.includes('임시') ? '임시 저장되었습니다.' : '변경 사항이 저장되었습니다.';
                type = 'success';
            }

            const executeCommon = () => {
                if (isDanger) closeConfirmModal();
                const originalInner = actionBtn.innerHTML;
                actionBtn.disabled = true;
                setTimeout(() => {
                    if (typeof BIDEO_LAYOUT !== 'undefined' && message) {
                        BIDEO_LAYOUT.showSnackbar(message, type);
                    }
                    actionBtn.disabled = false;
                    actionBtn.innerHTML = originalInner;
                }, 600);
            };

            if (isDanger) {
                openConfirmModal('작업 확인', `정말 ${btnText}하시겠습니까?`, executeCommon);
            } else if (message) {
                executeCommon();
            }
        }
    });
    
    // 사이드바 효과
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.addEventListener('mouseenter', () => sidebar.style.boxShadow = '4px 0 20px rgba(0,0,0,0.04)');
        sidebar.addEventListener('mouseleave', () => sidebar.style.boxShadow = 'none');
    }
});


// 모달 제어 함수들 (Global)

// 큐레이터 관리 모달 제어
function openCuratorModal(mode = 'registration') {
    const modal = document.getElementById('curator-modal');
    if (modal) {
        const title = document.getElementById('modal-title');
        if (title) title.textContent = (mode === 'edit') ? '큐레이터 정보 수정' : '새 큐레이터 등록';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeCuratorModal() {
    const modal = document.getElementById('curator-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// 공통 확인(Confirm) 모달 제어 함수
function openConfirmModal(title, message, onExecute) {
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    const executeBtn = document.getElementById('btn-confirm-execute');
    const newBtn = executeBtn.cloneNode(true);
    executeBtn.parentNode.replaceChild(newBtn, executeBtn);
    newBtn.addEventListener('click', () => {
        closeConfirmModal();
        if (onExecute) onExecute();
    });
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// 차단/제한 관리 및 상세 확인 모달 제어
function openBlockModal(user, date, reason) {
    const modal = document.getElementById('block-modal');
    if (modal) {
        document.getElementById('edit-block-user').value = user || '';
        document.getElementById('edit-block-date').value = date || '';
        document.getElementById('edit-block-reason').value = reason || '';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeBlockModal() {
    const modal = document.getElementById('block-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function openBlockDetailModal(user, date, reason) {
    const modal = document.getElementById('block-detail-modal');
    if (modal) {
        document.getElementById('detail-block-user').innerText = user || '-';
        document.getElementById('detail-block-date').innerText = date || '-';
        document.getElementById('detail-block-reason').innerText = reason || '-';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeBlockDetailModal() {
    const modal = document.getElementById('block-detail-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// 이미지 미리보기 확대 모달 제어 함수
function openImageModal(src) {
    let modal = document.getElementById('image-preview-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'image-preview-modal';
        modal.className = 'modal-overlay image-preview';
        modal.innerHTML = `
            <div class="modal-container image-only">
                <button class="modal-close" onclick="closeImageModal()">
                    <i data-lucide="x"></i>
                </button>
                <div class="modal-image-wrapper">
                    <img src="${src}" alt="Preview">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        if (typeof BIDEO_LAYOUT !== 'undefined') BIDEO_LAYOUT.initIcons();
    } else {
        modal.querySelector('img').src = src;
    }
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    modal.onclick = (e) => { if (e.target === modal) closeImageModal(); };
}

function closeImageModal() {
    const modal = document.getElementById('image-preview-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}
