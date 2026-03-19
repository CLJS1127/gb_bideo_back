// ===== 페이지 로드 완료 시 실행 =====
document.addEventListener("DOMContentLoaded", function () {
    // ===== 1. 기본 요소 선택 및 초기화 =====
    // HTML에서 class="my-order-list"인 메인 컨테이너 선택
    var listRoot = document.querySelector(".my-order-list");
    // 만약 my-order-list가 없으면 함수 종료 (현재 페이지는 결제상세 페이지라 없음)
    if (!listRoot) return;
    // ===== 2. 필터 셀렉트 박스 생성 (구매/판매/입찰 필터) =====
    // HTML에서 class="purchase_head .head_product"인 요소 선택
    var headProduct = document.querySelector(".purchase_head .head_product");
    if (headProduct) {
        // 셀렉트 드롭다운 HTML 생성 및 주입
        // "전체", "구매", "판매", "입찰" 옵션 포함
        headProduct.innerHTML =
            '<div class="section_filter">' +
            '<select class="section_filter_select" id="orderListType">' +
            '<option value="all">전체</option>' +
            '<option value="buy">구매</option>' +
            '<option value="sell">판매</option>' +
            '<option value="bid">입찰</option>' +
            "</select>" +
            "</div>";
    }

    // ===== 3. 추가 카드 생성 함수 =====
    function insertClonedCard(type, href, statusText) {
        var existingCard = listRoot.querySelector('.product_list_info_action[href*="' + href + '"]');
        if (existingCard) return;

        var templateCard = listRoot.querySelector(".product_list_info_action");
        if (!templateCard) return;

        var clonedCard = templateCard.cloneNode(true);
        clonedCard.setAttribute("href", href);
        clonedCard.setAttribute("data-card-type", type);

        var statusEl = clonedCard.querySelector(".label_item .text-element");
        if (statusEl) {
            statusEl.textContent = statusText;
            statusEl.dataset.originalText = statusText;
        }

        var sampleDivider = listRoot.querySelector(".divider_horizontal");
        var divider = sampleDivider ? sampleDivider.cloneNode(true) : null;
        var insertBeforeTarget = listRoot.querySelector(".list_loading") || null;

        if (divider) {
            listRoot.insertBefore(divider, insertBeforeTarget);
        }
        listRoot.insertBefore(clonedCard, insertBeforeTarget);
    }

    // ===== 4. 판매/입찰 카드 추가 실행 =====
    insertClonedCard("sell", "/my/selling/900000001", "판매완료");
    insertClonedCard("bid", "/my/bidding/900000002", "입찰완료");
    insertClonedCard("bid", "/my/bidding/900000003", "입찰완료");
    insertClonedCard("bid", "/my/bidding/900000004", "입찰완료");

    // ===== 5. 현재 상태의 모든 카드와 분리선 수집 =====
    // class="product_list_info_action"인 모든 상품 카드 선택
    var cards = Array.from(listRoot.querySelectorAll(".product_list_info_action"));
    // class="divider_horizontal"인 모든 구분선 선택
    var separators = Array.from(listRoot.querySelectorAll(".divider_horizontal"));
    // 페이지 제목 요소 선택 (".content_title .title h3")
    var pageTitleEl = document.querySelector(".content_title .title h3");
    
    // ===== 6. "내역이 없습니다" 메시지 요소 생성 =====
    var emptyEl = document.createElement("p");
    emptyEl.className = "type_empty"; // CSS 클래스 설정
    emptyEl.textContent = "해당 내역이 없습니다.";
    listRoot.appendChild(emptyEl); // listRoot의 마지막에 추가

    // ===== 7. 각 카드의 원본 상태 텍스트 저장 =====
    cards.forEach(function (card) {
        var statusEl = card.querySelector(".label_item .text-element");
        // 이미 저장된 데이터가 없으면 저장
        if (statusEl && !statusEl.dataset.originalText) {
            if (cardType(card) === "buy") {
                // 구매 카드면 "구매완료" 저장
                statusEl.dataset.originalText = "구매완료";
                statusEl.textContent = "구매완료";
            } else {
                // 다른 카드면 현재 텍스트 저장
                statusEl.dataset.originalText = statusEl.textContent.trim();
            }
        }
    });

    // ===== 8. 탭 요소 선택 및 설정 =====
    // ".purchase_list_tab .tab_item"인 처음 3개 탭 선택
    var historyTabs = Array.from(document.querySelectorAll(".purchase_list_tab .tab_item")).slice(0, 3);
    // 탭의 설정 정보: 키, 라벨
    var historyConfig = [
        { key: "buy", label: "구매내역" },
        { key: "sell", label: "판매내역" },
        { key: "bid", label: "입찰내역" }
    ];

    // ===== 10. 카드의 타입 판단 함수 =====
    // 카드의 href 속성 또는 data-card-type으로 구매/판매/입찰 타입을 판단한다.
    function cardType(card) {
        var explicitType = card.getAttribute("data-card-type");
        if (explicitType) return explicitType;

        var href = card.getAttribute("href") || "";
        if (href.indexOf("/my/selling/") !== -1) return "sell";
        if (href.indexOf("/my/bidding/") !== -1) return "bid";
        return "buy";
    }

    // ===== 11. 구분선 표시/숨김 갱신 함수 =====
    function refreshSeparators() {
        separators.forEach(function (divider) {
            // 다음 형제 요소 선택
            var next = divider.nextElementSibling;
            // ".product_list_info_action"인 요소를 찾을 때까지 다음으로 이동
            while (next && !next.classList.contains("product_list_info_action")) {
                next = next.nextElementSibling;
            }
            // 다음 요소가 있고 숨겨지지 않았으면 구분선 표시, 아니면 숨김
            divider.style.display = next && next.style.display !== "none" ? "" : "none";
        });
    }

    // ===== 12. 필터링 함수 =====
    // type: "all", "buy", "sell", "bid"
    function applyFilter(type) {
        var visibleCount = 0;

        // 모든 카드에 대해 필터 적용
        cards.forEach(function (card) {
            var kind = cardType(card);
            var show = type === "all" ? true : kind === type;
            card.style.display = show ? "" : "none";
            if (show) visibleCount += 1;

            // 상태 텍스트 업데이트
            var statusEl = card.querySelector(".label_item .text-element");
            if (statusEl) {
                statusEl.textContent = statusEl.dataset.originalText || statusEl.textContent;
            }
        });

        // 필터 타입에 따라 empty 메시지 텍스트 변경
        if (type === "sell") {
            emptyEl.textContent = "판매 내역이 없습니다.";
        } else if (type === "buy") {
            emptyEl.textContent = "구매 내역이 없습니다.";
        } else if (type === "bid") {
            emptyEl.textContent = "입찰 내역이 없습니다.";
        } else {
            emptyEl.textContent = "해당 내역이 없습니다.";
        }
        // 표시된 카드가 없으면 empty 메시지 표시, 있으면 숨김
        emptyEl.style.display = visibleCount === 0 ? "block" : "none";
        
        // 구분선 표시/숨김 갱신
        refreshSeparators();
    }

    // ===== 13. 페이지 제목 업데이트 함수 =====
    // type에 따라 페이지 제목 변경
    function updatePageTitle(type) {
        if (!pageTitleEl) return;
        if (type === "sell") {
            pageTitleEl.textContent = "판매 내역";
        } else if (type === "bid") {
            pageTitleEl.textContent = "입찰 내역";
        } else if (type === "all") {
            pageTitleEl.textContent = "전체 내역";
        } else {
            pageTitleEl.textContent = "구매 내역";
        }
    }

    // ===== 14. 셀렉트 박스 변경 이벤트 리스너 =====
    var select = document.getElementById("orderListType");
    if (select) {
        select.addEventListener("change", function () {
            var selectedType = select.value || "all";
            // 필터 적용
            applyFilter(selectedType);
            // 탭 활성화 업데이트
            activateHistoryTab(selectedType);
            // 페이지 제목 업데이트
            updatePageTitle(selectedType);
        });
    }

    // ===== 15. 탭별 카운트 업데이트 함수 =====
    function updateHistoryCounts() {
        // 각 타입별 카드 개수 계산
        var counts = {
            buy: cards.filter(function (card) { return cardType(card) === "buy"; }).length,
            sell: cards.filter(function (card) { return cardType(card) === "sell"; }).length,
            bid: cards.filter(function (card) { return cardType(card) === "bid"; }).length
        };

        // 각 탭의 카운트 업데이트
        historyTabs.forEach(function (tab) {
            var type = tab.getAttribute("data-history-type");
            // ".count" 클래스 요소 선택
            var countEl = tab.querySelector(".count");
            if (!countEl || !counts.hasOwnProperty(type)) return;
            countEl.textContent = String(counts[type]);
        });
    }

    // ===== 16. 탭 활성화 함수 =====
    // 지정된 type의 탭을 활성화하고 나머지는 비활성화
    function activateHistoryTab(type) {
        historyTabs.forEach(function (tab) {
            var active = tab.getAttribute("data-history-type") === type;
            if (active) {
                // 활성화된 탭에 "tab_on" 클래스 추가
                tab.classList.add("tab_on");
            } else {
                // 비활성화 탭에서 "tab_on" 클래스 제거
                tab.classList.remove("tab_on");
            }
        });
    }

    // ===== 17. 탭 초기 설정 및 이벤트 리스너 =====
    historyTabs.forEach(function (tab, index) {
        var config = historyConfig[index];
        if (!config) return;

        // data-history-type 속성 설정 (buy, sell, bid)
        tab.setAttribute("data-history-type", config.key);
        
        // 탭 제목 업데이트
        var titleEl = tab.querySelector(".title");
        if (titleEl) {
            titleEl.textContent = config.label;
        }

        // 탭 링크의 클릭 이벤트 리스너
        var link = tab.querySelector("a");
        if (link) {
            link.addEventListener("click", function (event) {
                event.preventDefault(); // 기본 링크 동작 방지
                // 탭 활성화
                activateHistoryTab(config.key);
                // 필터 적용
                applyFilter(config.key);
                // 페이지 제목 업데이트
                updatePageTitle(config.key);
                // 셀렉트 박스 값 동기화
                if (select) {
                    select.value = config.key;
                }
            });
        }
    });

    // ===== 18. 초기 상태 설정 =====
    // 탭별 카운트 업데이트
    updateHistoryCounts();
    // 전체 셀렉트 기본값
    activateHistoryTab("all");
    // 셀렉트 박스 초기값 설정
    if (select) {
        select.value = "all";
    }
    // 전체 필터 적용 (기본값)
    applyFilter("all");
    // 페이지 제목 설정
    updatePageTitle("all");
});
