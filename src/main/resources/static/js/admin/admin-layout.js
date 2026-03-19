// admin-layout.js - UI 및 레이아웃 관련 스크립트 처리

const BIDEO_LAYOUT = {

    //공통 LNB 로드 및 현재 메뉴 자동 활성화
    loadLNB: async () => {
        const lnbContainer = document.getElementById('admin-lnb');
        if (!lnbContainer) return;
        try {
            const response = await fetch('admin-lnb.html');
            const html = await response.text();
            lnbContainer.innerHTML = html;
            BIDEO_LAYOUT.initIcons();
            BIDEO_LAYOUT.setAutoActiveMenu();
        } catch (error) { console.error('LNB 로드 실패:', error); }
    },

    // URL 또는 텍스트 기반 메뉴 활성화
    setAutoActiveMenu: () => {
        const path = window.location.pathname.split('/').pop() || 'admin.html';
        const allItems = document.querySelectorAll('.nav-item');
        const pageTitle = document.querySelector('.main-content .breadcrumbs .current')?.textContent.trim();
        
        let targetHref = path;
        const detailToMemberList = {
            'payment-detail': 'admin-payment-list.html',
            'withdrawal-detail': 'admin-withdrawal-list.html',
            'artwork-detail': 'admin-artwork-list.html',
            'auction-detail': 'admin-auction-list.html',
            'display-detail': 'admin-display-list.html',
            'inquiry-detail': 'admin-inquiry-list.html',
            'member-detail': 'admin-member-list.html'
        };

        for (const [detail, list] of Object.entries(detailToMemberList)) {
            if (path.includes(detail)) {
                targetHref = list;
                break;
            }
        }

        allItems.forEach(item => {
            const href = item.getAttribute('href');
            const itemText = item.textContent.trim();
            const isMatch = (href && href !== 'javascript:void(0);' && (href === targetHref || targetHref.includes(href))) || 
                          (pageTitle && itemText === pageTitle);

            if (isMatch) {
                item.classList.add('active'); 
            }
        });
    },

    // 상세 페이지 동적 렌더링 통합
    initDynamicDetail: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const path = window.location.pathname;
        
        if (path.includes('payment-detail')) BIDEO_LAYOUT.renderPaymentDetail(status || 'completed');
        if (path.includes('withdrawal-detail')) BIDEO_LAYOUT.renderWithdrawalDetail(status || 'pending');
        if (path.includes('artwork-detail')) BIDEO_LAYOUT.renderArtworkDetail(status || 'active');
        if (path.includes('auction-detail')) BIDEO_LAYOUT.renderAuctionDetail(status || 'ongoing');
        if (path.includes('display-detail')) BIDEO_LAYOUT.renderDisplayDetail(status || 'on');
    },

    clearCardThemes: (card) => {
        card.classList.remove('theme-dark', 'theme-success', 'theme-danger', 'theme-warning', 'theme-black');
    },

    // 결제 상세
    renderPaymentDetail: (status) => {
        const badge = document.querySelector('.status-badge');
        const summaryCard = document.querySelector('.summary-card');
        if (!badge || !summaryCard) return;
        summaryCard.querySelectorAll('.dynamic-btn, .action-desc, .btn-group').forEach(el => el.remove());
        BIDEO_LAYOUT.clearCardThemes(summaryCard);

        if (status === 'completed') {
            badge.textContent = '결제완료'; badge.className = 'status-badge status-active';
            summaryCard.classList.add('theme-success');
            summaryCard.insertAdjacentHTML('beforeend', `
                <p class="action-desc fs-13 mt-20 fw-600 text-success">✓ 결제 및 승인이 완료되었습니다.</p>
                <div class="btn-group"><button class="dynamic-btn btn-danger">결제 강제 취소</button></div>
            `);
        } else if (status === 'cancelled') {
            badge.textContent = '결제취소'; badge.className = 'status-badge status-urgent';
            summaryCard.classList.add('theme-danger');
            summaryCard.insertAdjacentHTML('beforeend', `<p class="action-desc fs-13 mt-20 fw-600">✕ 환불 처리가 완료되었습니다.</p>`);
        } else if (status === 'pending') {
            badge.textContent = '결제대기'; badge.className = 'status-badge status-pending';
            summaryCard.classList.add('theme-dark');
            summaryCard.insertAdjacentHTML('beforeend', `
                <hr class="dynamic-btn border-none mt-24 mb-24" style="border-top: 1px solid rgba(255,255,255,0.1) !important;">
                <p class="action-desc fs-12 mb-16 fw-500">가상계좌 입금 대기 중입니다.</p>
                <div class="btn-group"><button class="dynamic-btn btn-secondary">알림 재발송</button></div>
            `);
        }
    },

    // 출금 상세
    renderWithdrawalDetail: (status) => {
        const badge = document.querySelector('.status-badge');
        const summaryCard = document.querySelector('.summary-card');
        if (!badge || !summaryCard) return;
        summaryCard.querySelectorAll('.dynamic-btn, .action-desc, .btn-group').forEach(el => el.remove());
        BIDEO_LAYOUT.clearCardThemes(summaryCard);

        if (status === 'pending') {
            badge.textContent = '승인대기'; badge.className = 'status-badge status-pending';
            summaryCard.classList.add('theme-dark');
            summaryCard.insertAdjacentHTML('beforeend', `
                <hr class="dynamic-btn border-none mt-24 mb-24" style="border-top: 1px solid rgba(255,255,255,0.1) !important;">
                <p class="action-desc fs-12 mb-16 fw-500">계좌 정보를 확인해주세요.</p>
                <div class="btn-group">
                    <button class="dynamic-btn btn-success">승인하기</button>
                    <button class="dynamic-btn btn-danger">반려하기</button>
                </div>
            `);
        } else if (status === 'approved') {
            badge.textContent = '승인완료'; badge.className = 'status-badge status-active';
            summaryCard.classList.add('theme-success');
            summaryCard.insertAdjacentHTML('beforeend', `<p class="action-desc fs-13 mt-20 fw-600">✓ 송금이 완료되었습니다.</p>`);
        } else if (status === 'rejected') {
            badge.textContent = '반려됨'; badge.className = 'status-badge status-urgent';
            summaryCard.classList.add('theme-danger');
            summaryCard.insertAdjacentHTML('beforeend', `<p class="action-desc fs-13 mt-20 fw-600">✕ 반려 처리되었습니다.</p>`);
        }
    },

    // 작품 상세
    renderArtworkDetail: (status) => {
        const badge = document.querySelector('.status-badge');
        const summaryCard = document.querySelector('.summary-card');
        if (!badge || !summaryCard) return;
        summaryCard.querySelectorAll('.dynamic-btn, .action-desc, .btn-group').forEach(el => el.remove());
        BIDEO_LAYOUT.clearCardThemes(summaryCard);

        if (status === 'active') {
            badge.textContent = '전시중'; badge.className = 'status-badge status-active';
            summaryCard.classList.add('theme-success');
            summaryCard.insertAdjacentHTML('beforeend', `
                <div class="btn-group">
                    <button class="dynamic-btn btn-danger" onclick="BIDEO_LAYOUT.openStopExhibitionModal()">전시 중단</button>
                </div>
            `);
        } else {
            badge.textContent = '숨김'; badge.className = 'status-badge status-urgent';
            summaryCard.classList.add('theme-danger');
            summaryCard.insertAdjacentHTML('beforeend', `
                <div class="btn-group">
                    <button class="dynamic-btn btn-success">다시 전시</button>
                    <button class="dynamic-btn btn-secondary">영구 삭제</button>
                </div>
            `);
        }
    },

    // 경매 상세
    renderAuctionDetail: (status) => {
        const badge = document.querySelector('.status-badge');
        const summaryCard = document.querySelector('.summary-card');
        if (!badge || !summaryCard) return;
        summaryCard.querySelectorAll('.dynamic-btn, .action-desc, .btn-group').forEach(el => el.remove());
        BIDEO_LAYOUT.clearCardThemes(summaryCard);

        if (status === 'ongoing') {
            badge.textContent = '진행중'; badge.className = 'status-badge status-active';
            summaryCard.classList.add('theme-dark');
            summaryCard.insertAdjacentHTML('beforeend', `
                <p class="action-desc fs-12 mb-16 fw-500">입찰이 진행 중입니다.</p>
                <div class="btn-group"><button class="dynamic-btn btn-danger" onclick="BIDEO_LAYOUT.openEndAuctionModal()">경매 종료</button></div>
            `);
        } else {
            badge.textContent = '종료'; badge.className = 'status-badge status-pending';
            summaryCard.classList.add('theme-black');
            summaryCard.insertAdjacentHTML('beforeend', `<p class="action-desc fs-12 mt-16 text-muted">경매가 종료되었습니다.</p>`);
        }
    },

    // 노출 제어 상세
    renderDisplayDetail: (status) => {
        const badge = document.querySelector('.status-badge');
        const summaryCard = document.querySelector('.summary-card');
        if (!badge || !summaryCard) return;
        summaryCard.querySelectorAll('.dynamic-btn, .action-desc, .btn-group').forEach(el => el.remove());
        BIDEO_LAYOUT.clearCardThemes(summaryCard);

        if (status === 'on') {
            badge.textContent = '노출중'; badge.className = 'status-badge status-active';
            summaryCard.classList.add('theme-success');
            summaryCard.insertAdjacentHTML('beforeend', `
                <div class="btn-group">
                    <button class="dynamic-btn btn-secondary">순서 변경</button>
                    <button class="dynamic-btn btn-danger">노출 중단</button>
                </div>
            `);
        } else {
            badge.textContent = '중단'; badge.className = 'status-badge status-urgent';
            summaryCard.classList.add('theme-danger');
            summaryCard.insertAdjacentHTML('beforeend', `<div class="btn-group"><button class="dynamic-btn btn-success">다시 노출</button></div>`);
        }
    },

    initIcons: () => { if (typeof lucide !== 'undefined') lucide.createIcons(); },

    // 모달 제어 함수들
    openStopExhibitionModal: () => {
        const modal = document.getElementById('stop-exhibition-modal');
        if (modal) {
            modal.classList.add('show');
            BIDEO_LAYOUT.initIcons();
        }
    },

    closeStopExhibitionModal: () => {
        const modal = document.getElementById('stop-exhibition-modal');
        if (modal) modal.classList.remove('show');
    },

    openEndAuctionModal: () => {
        const modal = document.getElementById('end-auction-modal');
        if (modal) {
            modal.classList.add('show');
            BIDEO_LAYOUT.initIcons();
        }
    },

    closeEndAuctionModal: () => {
        const modal = document.getElementById('end-auction-modal');
        if (modal) modal.classList.remove('show');
    },

    // 확인 처리 함수 (백엔드 연동 전 임시 처리)
    confirmStopExhibition: () => {
        const reason = document.getElementById('stop-reason').value;
        if (!reason) {
            alert('중단 사유를 입력해주세요.');
            return;
        }
        alert(`전시가 중단되었습니다.\n사유: ${reason}`);
        BIDEO_LAYOUT.closeStopExhibitionModal();
        // 추후 API 호출 로직 추가 필요
    },

    confirmEndAuction: () => {
        const reason = document.getElementById('end-reason').value;
        if (!reason) {
            alert('종료 사유를 입력해주세요.');
            return;
        }
        alert(`경매가 종료되었습니다.\n사유: ${reason}`);
        BIDEO_LAYOUT.closeEndAuctionModal();
        // 추후 API 호출 로직 추가 필요
    },

    // 핀터레스트 스타일 스낵바 표시 (Admin Custom)
    showSnackbar: (message, type = 'success') => {
        // CSS 동적 로드 (최초 1회)
        if (!document.getElementById('admin-snackbar-style')) {
            const link = document.createElement('link');
            link.id = 'admin-snackbar-style';
            link.rel = 'stylesheet';
            link.href = '../../static/css/admin/admin-snackbar.css';
            document.head.appendChild(link);
        }

        let snackbar = document.getElementById('admin-snackbar');
        if (!snackbar) {
            snackbar = document.createElement('div');
            snackbar.id = 'admin-snackbar';
            document.body.appendChild(snackbar);
        }

        const iconMap = { 
            success: 'check-circle', 
            error: 'alert-circle', 
            info: 'info',
            warning: 'alert-triangle'
        };

        snackbar.className = ''; // 기존 클래스 초기화
        snackbar.innerHTML = `
            <div class="snackbar-icon ${type}"><i data-lucide="${iconMap[type] || 'check-circle'}"></i></div>
            <div class="snackbar-message">${message}</div>
        `;
        
        BIDEO_LAYOUT.initIcons();
        
        // 애니메이션 처리
        requestAnimationFrame(() => {
            snackbar.classList.add('show');
            setTimeout(() => snackbar.classList.remove('show'), 3000);
        });
    },

    // 메뉴 클릭시 acitve 추가 기능
    updateActiveState: (targetItem, allItems) => {
        allItems.forEach(item => item.classList.remove('active'));
        targetItem.classList.add('active');
    },

    // 서브타이틀(설명글)
    updateHeader: (title) => {
        const pageTitle = document.querySelector('.main-content header h1');
        const pageDescription = document.querySelector('.main-content header p');
        if (pageTitle) pageTitle.textContent = title;
        if (pageDescription) {
            const descriptions = {
                '문의 관리 목록': 'BIDEO 서비스 이용 관련 고객 문의 사항을 확인하고 답변을 관리합니다.',
                '차단/제한 관리': '부정 이용자 및 규정 위반 계정에 대한 이용 제한 상태를 관리합니다.',
                '작품 목록': 'BIDEO에 등록된 모든 예술 작품의 전시 상태와 상세 정보를 관리합니다.',
                '경매 목록': '실시간 및 예정된 모든 비디오 작품 경매의 진행 현황을 실시간으로 모니터링합니다.',
                '노출 제어 목록': '메인 페이지 및 주요 섹션에 노출될 콘텐츠의 우선순위와 노출 여부를 설정합니다.',
                '메인 큐레이터 설정': 'BIDEO 메인 화면에 등장할 추천 큐레이터 정보와 테마를 관리합니다.',
                '출금 승인 목록': '아티스트들의 출금 요청 내역을 검토하고 승인을 관리합니다.',
                '결제 내역 목록': 'BIDEO 서비스 내에서 발생한 모든 결제 트랜잭션을 관리합니다.'
            };
            pageDescription.textContent = descriptions[title] || `BIDEO ${title} 페이지입니다. 관리 및 조회가 가능합니다.`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    BIDEO_LAYOUT.loadLNB();
    BIDEO_LAYOUT.initDynamicDetail();
});
