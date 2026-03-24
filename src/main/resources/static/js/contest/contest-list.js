window.addEventListener('load', function () {
    const grid = document.getElementById('contestGrid');
    const emptyEl = document.getElementById('contestEmpty');
    const paginationEl = document.getElementById('contestPagination');
    const keywordInput = document.getElementById('contestKeyword');
    const searchBtn = document.getElementById('contestSearchBtn');
    const sortBtns = document.querySelectorAll('.sort-btn[data-sort]');
    const myContestBtn = document.getElementById('myContestBtn');
    const myEntryBtn = document.getElementById('myEntryBtn');

    let currentSort = '';
    let currentKeyword = '';
    let currentMine = false;
    let currentParticipated = false;
    let currentPage = 1;
    const pageSize = 20;

    // 초기 페이지네이션 렌더 (SSR 데이터 활용)
    if (window.INITIAL_PAGE && window.INITIAL_PAGE.totalPages > 1) {
        renderPagination(window.INITIAL_PAGE);
    }

    // ── 정렬 버튼 클릭 ──
    sortBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            currentSort = this.dataset.sort;
            currentPage = 1;
            sortBtns.forEach(function (b) { b.classList.remove('sort-btn--active'); });
            this.classList.add('sort-btn--active');
            fetchContests();
        });
    });

    // ── 내 공모전 토글 ──
    if (myContestBtn) {
        myContestBtn.addEventListener('click', function () {
            currentMine = !currentMine;
            if (currentMine) {
                currentParticipated = false;
                if (myEntryBtn) myEntryBtn.classList.remove('sort-btn--active');
            }
            currentPage = 1;
            this.classList.toggle('sort-btn--active', currentMine);
            fetchContests();
        });
    }

    // ── 참여한 공모전 토글 ──
    if (myEntryBtn) {
        myEntryBtn.addEventListener('click', function () {
            currentParticipated = !currentParticipated;
            if (currentParticipated) {
                currentMine = false;
                if (myContestBtn) myContestBtn.classList.remove('sort-btn--active');
            }
            currentPage = 1;
            this.classList.toggle('sort-btn--active', currentParticipated);
            fetchContests();
        });
    }

    // ── 검색 버튼 클릭 ──
    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            currentKeyword = keywordInput ? keywordInput.value.trim() : '';
            currentPage = 1;
            fetchContests();
        });
    }

    // ── Enter 키로 검색 ──
    if (keywordInput) {
        keywordInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                currentKeyword = this.value.trim();
                currentPage = 1;
                fetchContests();
            }
        });
    }

    // ── API 호출 ──
    function fetchContests() {
        const params = new URLSearchParams();
        params.set('page', currentPage);
        params.set('size', pageSize);
        if (currentSort) params.set('sort', currentSort);
        if (currentKeyword) params.set('keyword', currentKeyword);
        if (currentMine) params.set('mine', 'true');
        if (currentParticipated) params.set('participated', 'true');

        fetch('/contest/api/list?' + params.toString())
            .then(function (res) { return res.json(); })
            .then(function (data) {
                renderGrid(data.content || []);
                renderPagination(data);
            })
            .catch(function (err) {
                console.error('공모전 목록 로드 실패:', err);
            });
    }

    // ── 카드 그리드 렌더링 ──
    function renderGrid(contests) {
        if (!grid) return;
        if (!contests.length) {
            grid.innerHTML = '';
            grid.style.display = 'none';
            if (emptyEl) emptyEl.style.display = '';
            return;
        }
        grid.style.display = '';
        if (emptyEl) emptyEl.style.display = 'none';

        grid.innerHTML = contests.map(function (c) {
            return '<div class="contest-card">' +
                '<a href="/contest/detail/' + c.id + '" class="card-link">' +
                '<div class="card-thumb">' +
                (c.coverImage ? '<img src="' + escapeHtml(c.coverImage) + '" alt="공모전 썸네일">' : '') +
                '<span class="card-dday">' + escapeHtml(c.dday || c.dDay || '') + '</span>' +
                '</div>' +
                '<div class="card-body">' +
                '<p class="card-category">' + escapeHtml(c.category || '') + '</p>' +
                '<h3 class="card-title">' + escapeHtml(c.title || '') + '</h3>' +
                '<p class="card-host">' + escapeHtml(c.organizer || '') + '</p>' +
                '<p class="card-deadline">' +
                '<span class="deadline-label">마감일</span>' +
                '<span>' + escapeHtml(c.entryEnd || '') + '</span>' +
                '</p>' +
                '</div>' +
                '</a>' +
                '</div>';
        }).join('');
    }

    // ── 페이지네이션 렌더링 ──
    function renderPagination(pageData) {
        if (!paginationEl) return;
        const total = pageData.totalPages || 0;
        const current = pageData.page || 1;
        if (total <= 1) {
            paginationEl.innerHTML = '';
            return;
        }

        let html = '';
        var prevSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
        var nextSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';

        // 이전
        if (current > 1) {
            html += '<button class="page-btn page-btn--prev" data-page="' + (current - 1) + '" type="button" aria-label="이전 페이지">' + prevSvg + '</button>';
        } else {
            html += '<span class="page-btn page-btn--prev page-btn--disabled" aria-disabled="true">' + prevSvg + '</span>';
        }

        // 페이지 번호 (5개 윈도우)
        var startPage = current - 2 > 0 ? (current + 2 > total ? (total - 4 > 0 ? total - 4 : 1) : current - 2) : 1;
        var endPage = startPage + 4 > total ? total : startPage + 4;
        for (var i = startPage; i <= endPage; i++) {
            if (i === current) {
                html += '<span class="page-btn page-btn--active">' + i + '</span>';
            } else {
                html += '<button class="page-btn" data-page="' + i + '" type="button">' + i + '</button>';
            }
        }

        // 다음
        if (current < total) {
            html += '<button class="page-btn page-btn--next" data-page="' + (current + 1) + '" type="button" aria-label="다음 페이지">' + nextSvg + '</button>';
        } else {
            html += '<span class="page-btn page-btn--next page-btn--disabled" aria-disabled="true">' + nextSvg + '</span>';
        }

        paginationEl.innerHTML = html;

        // 페이지 버튼 이벤트
        paginationEl.querySelectorAll('button[data-page]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                currentPage = parseInt(this.dataset.page, 10);
                fetchContests();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    // ── HTML 이스케이프 ──
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── 북마크 토글 ──
    document.querySelectorAll('.card-bookmark').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });
    });
});
