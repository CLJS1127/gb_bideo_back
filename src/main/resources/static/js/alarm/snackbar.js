// BIDEO 스낵바 모듈

const BideoSnackbar = {
    timer: null,
    
    show(message, type = 'success', duration = 3000, action = null) {
        // 요소 초기화: 스낵바 요소를 생성하거나 재사용하며 기존 타이머를 제거합니다.
        let snackbar = document.getElementById('bideo-snackbar');
        if (!snackbar) {
            snackbar = document.createElement('div');
            snackbar.id = 'bideo-snackbar';
            snackbar.className = 'bideo-snackbar';
            document.body.appendChild(snackbar);
        }

        if (this.timer) {
            clearTimeout(this.timer);
            snackbar.classList.remove('show');
        }

        // 테마 및 콘텐츠 설정: 타입별 아이콘 매핑과 액션 버튼(URL/콜백)을 포함한 HTML을 구성합니다.
        const iconMap = {
            success: 'check-circle', error: 'alert-circle', auction: 'gavel', 'auction-win': 'trophy',
            loading: 'loader', heart: 'heart', follow: 'user-plus', block: 'shield-off', report: 'alert-triangle',
            payment: 'credit-card', comment: 'message-square', share: 'share-2', like: 'thumbs-up',
            transaction: 'check-square', settlement: 'wallet', pen: 'pen-tool', gallery: 'layout'
        };

        let themeClass = type;
        let iconName = iconMap[type] || 'info';

        // 경매 테마 처리: auction으로 시작하는 타입은 auction 테마를 기본으로 사용합니다.
        if (type.startsWith('auction')) {
            themeClass = 'auction';
            iconName = iconMap[type] || 'gavel';
        }

        // 클래스 부여: 기본 스낵바 클래스 + 테마 클래스 + 개별 타입 클래스
        snackbar.className = `bideo-snackbar ${themeClass} ${type}`;
        let contentHtml = `
            <div class="bideo-snackbar-icon"><i data-lucide="${iconName}"></i></div>
            <div class="bideo-snackbar-message">${message}</div>
        `;

        if (action && action.label) {
            if (action.url) {
                contentHtml += `<a href="${action.url}" class="bideo-snackbar-action">${action.label}</a>`;
            } else if (action.callback) {
                const btnId = 'snack-btn-' + Date.now();
                contentHtml += `<button id="${btnId}" class="bideo-snackbar-action">${action.label}</button>`;
                setTimeout(() => document.getElementById(btnId)?.addEventListener('click', action.callback), 0);
            }
        }

        // 애니메이션 및 자동 숨김: Lucide 아이콘을 렌더링하고 애니메이션 실행 후 일정 시간이 지나면 숨깁니다.
        snackbar.innerHTML = contentHtml;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => snackbar.classList.add('show'), 10);

        if (type !== 'loading') {
            this.timer = setTimeout(() => {
                snackbar.classList.remove('show');
                this.timer = null;
            }, duration);
        }
    }
};
