/**
 * BIDEO Error Page Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    // Lucide 아이콘 초기화
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 모달 닫기 버튼 등 공통 이벤트 처리
    const closeBtns = document.querySelectorAll('.btn-confirm, .btn-modal-close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 모달 닫기 로직 (필요 시)
            console.log('Error UI closed');
        });
    });
});
