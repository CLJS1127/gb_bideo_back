window.onload = () => {
    // FAQ 아코디언 토글
    const faqSection = document.querySelector('[data-cy="section-faqs"]');
    if (faqSection) {
        const faqButtons = faqSection.querySelectorAll('button[aria-expanded]');
        faqButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const li = btn.closest('li');
                if (!li) return;

                const isOpen = li.getAttribute('data-state') === 'open';
                const newState = isOpen ? 'closed' : 'open';

                li.setAttribute('data-state', newState);
                btn.setAttribute('data-state', newState);
                btn.setAttribute('aria-expanded', String(!isOpen));

                const regionId = btn.getAttribute('aria-controls');
                if (regionId) {
                    const region = document.getElementById(regionId);
                    if (region) {
                        region.setAttribute('data-state', newState);
                        region.style.display = isOpen ? 'none' : 'block';
                    }
                }
            });
        });
    }

    // 네비게이션 메뉴 드롭다운 토글
    const navButtons = document.querySelectorAll('nav [data-cy$="-menu"]');
    navButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const isOpen = btn.getAttribute('data-state') === 'open';
            const newState = isOpen ? 'closed' : 'open';
            btn.setAttribute('data-state', newState);
            btn.setAttribute('aria-expanded', String(!isOpen));

            const dialogId = btn.getAttribute('aria-controls');
            if (dialogId) {
                const dialog = document.getElementById(dialogId);
                if (dialog) {
                    dialog.setAttribute('data-state', newState);
                    dialog.style.display = isOpen ? 'none' : 'block';
                }
            }
        });
    });

    // 모바일 메뉴 토글
    const menuToggle = document.querySelector('button .sr-only, button ._1uvu8nb0');
    if (menuToggle) {
        const toggleBtn = menuToggle.closest('button');
        const mobileNav = document.querySelector('nav.mr-auto');
        if (toggleBtn && mobileNav) {
            toggleBtn.addEventListener('click', function () {
                const isHidden = mobileNav.classList.contains('hidden');
                if (isHidden) {
                    mobileNav.classList.remove('hidden');
                    mobileNav.classList.add('flex');
                } else {
                    mobileNav.classList.add('hidden');
                    mobileNav.classList.remove('flex');
                }
            });
        }
    }

    // 다크모드 테마 적용
    (function () {
        try {
            const theme = localStorage.getItem('fp:theme');
            if (theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (_) { }
    })();

    // intro-main CTA → auth-modal 로그인 모달
    (function () {
        const triggers = document.querySelectorAll('[data-login-trigger="intro-login-modal"]');
        triggers.forEach(function (trigger) {
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                showAuthModal();
            });
        });
    })();

    // 인기 영상 슬라이더 - 무한 루프 + 자동 스크롤
    (function () {
        const section = document.querySelector('[data-cy="section-featured-sales"]');
        if (!section) return;
        const backwardBtn = section.querySelector('[data-cy="backward-arrow"]');
        const forwardBtn = section.querySelector('[data-cy="forward-arrow"]');
        const slider = section.nextElementSibling;
        if (!backwardBtn || !forwardBtn || !slider) return;

        const originalSlides = Array.from(slider.querySelectorAll('.keen-slider__slide'));
        const TOTAL = originalSlides.length;
        if (TOTAL === 0) return;

        // 앞뒤로 슬라이드 복제
        const fragBefore = document.createDocumentFragment();
        const fragAfter = document.createDocumentFragment();
        originalSlides.forEach(s => fragBefore.appendChild(s.cloneNode(true)));
        originalSlides.forEach(s => fragAfter.appendChild(s.cloneNode(true)));
        slider.insertBefore(fragBefore, slider.firstChild);
        slider.appendChild(fragAfter);

        function getSlideWidth() {
            const slide = slider.querySelector('.keen-slider__slide');
            if (!slide) return slider.clientWidth;
            const gap = parseFloat(getComputedStyle(slider).gap) || 16;
            return slide.offsetWidth + gap;
        }

        // 원본 세트 시작 위치로 즉시 이동
        function jumpToOriginals() {
            slider.style.scrollBehavior = 'auto';
            slider.style.scrollSnapType = 'none';
            slider.scrollLeft = TOTAL * getSlideWidth();
            requestAnimationFrame(() => {
                slider.style.scrollSnapType = 'x mandatory';
                slider.style.scrollBehavior = '';
            });
        }
        jumpToOriginals();

        // 경계 감지 + 즉시 점프 (debounce 150ms)
        let scrollTimer = null;
        function onScrollEnd() {
            const sw = getSlideWidth();
            const oneSet = TOTAL * sw;
            const pos = slider.scrollLeft;
            if (pos >= 2 * oneSet - sw / 2) {
                slider.style.scrollSnapType = 'none';
                slider.style.scrollBehavior = 'auto';
                slider.scrollLeft = pos - oneSet;
                requestAnimationFrame(() => {
                    slider.style.scrollSnapType = 'x mandatory';
                    slider.style.scrollBehavior = '';
                });
            } else if (pos <= sw / 2) {
                slider.style.scrollSnapType = 'none';
                slider.style.scrollBehavior = 'auto';
                slider.scrollLeft = pos + oneSet;
                requestAnimationFrame(() => {
                    slider.style.scrollSnapType = 'x mandatory';
                    slider.style.scrollBehavior = '';
                });
            }
        }
        slider.addEventListener('scroll', () => {
            if (scrollTimer) clearTimeout(scrollTimer);
            scrollTimer = setTimeout(onScrollEnd, 150);
        });

        // 화살표 — 항상 활성
        forwardBtn.addEventListener('click', () => {
            slider.scrollBy({ left: getSlideWidth(), behavior: 'smooth' });
            resetAutoScroll();
        });
        backwardBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -getSlideWidth(), behavior: 'smooth' });
            resetAutoScroll();
        });

        // 자동 스크롤 (4초)
        const AUTO_INTERVAL = 4000;
        let autoTimer = null;
        function startAutoScroll() {
            stopAutoScroll();
            autoTimer = setInterval(() => {
                slider.scrollBy({ left: getSlideWidth(), behavior: 'smooth' });
            }, AUTO_INTERVAL);
        }
        function stopAutoScroll() {
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        }
        function resetAutoScroll() {
            stopAutoScroll();
            startAutoScroll();
        }
        slider.addEventListener('mouseenter', stopAutoScroll);
        slider.addEventListener('mouseleave', startAutoScroll);
        slider.addEventListener('touchstart', stopAutoScroll, { passive: true });
        slider.addEventListener('touchend', startAutoScroll);
        startAutoScroll();
    })();

    // 영상 자동재생 — 뷰포트에 보이면 play(), 벗어나면 pause()
    (function () {
        const videos = document.querySelectorAll('video[autoplay]');
        if (!videos.length) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(function () {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.25 });

        videos.forEach(function (video) {
            observer.observe(video);
        });
    })();

    // 스크롤 트리거 애니메이션
    (function () {
        const targets = document.querySelectorAll('.scroll-fade-up');
        if (!targets.length) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target); // 한 번만 실행
                }
            });
        }, {
            threshold: 0.15,       // 15% 보이면 트리거
            rootMargin: '0px 0px -60px 0px'  // 하단 60px 여유
        });

        targets.forEach(function (el) {
            observer.observe(el);
        });
    })();

    // 헤더 내비게이션 스크롤 활성 링크 하이라이트
    (function () {
        const sectionIds = ['section-hero', 'section-features', 'section-counters', 'section-faqs'];
        const navLinks = document.querySelectorAll('.site-intro-header__nav a[href^="#section-"]');
        if (!navLinks.length) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                navLinks.forEach(function (link) {
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('is-active');
                    } else {
                        link.classList.remove('is-active');
                    }
                });
            });
        }, {
            rootMargin: '-70px 0px -50% 0px',
            threshold: 0.2
        });

        sectionIds.forEach(function (id) {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });
    })();
}




