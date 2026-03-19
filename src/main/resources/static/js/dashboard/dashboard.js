document.addEventListener("DOMContentLoaded", () => {
    // 대시보드 상단에 표시할 크리에이터 이름 영역입니다.
    const creatorNameNode = document.getElementById("dashboardCreatorName");
    const creatorSummaryNode = document.getElementById("dashboardCreatorSummary");

    // 현재 화면에서 애니메이션을 줄 요약 탭과 패널 목록입니다.
    const summaryTabs = document.querySelectorAll(".tab_item");
    const panels = document.querySelectorAll(".dashboard-panel, .dashboard-section");
    const chartButtons = document.querySelectorAll("[data-chart-series]");
    const chartLines = document.querySelectorAll("[data-chart-line]");
    const chartPoints = document.querySelectorAll("[data-chart-points]");

    // 로그인 후 저장됐을 가능성이 있는 이름 키들을 순서대로 확인합니다.
    const creatorNameKeys = [
        "creatorName",
        "memberName",
        "username",
        "profileUsername",
        "nickname"
    ];

    // body에 서버 값이 들어오면 가장 우선으로 사용합니다.
    const bodyCreatorName = document.body.dataset.creatorName?.trim();

    // storage에서 첫 번째로 찾은 유효한 값을 반환합니다.
    const storedCreatorName = creatorNameKeys
        .map((key) => window.localStorage.getItem(key) || window.sessionStorage.getItem(key))
        .find((value) => typeof value === "string" && value.trim().length > 0);

    // 서버 값이 없으면 storage 값을 사용하고, 둘 다 없으면 기본 문구를 유지합니다.
    const creatorName = bodyCreatorName || storedCreatorName || "크리에이터";

    if (creatorNameNode) {
        creatorNameNode.textContent = creatorName;
    }

    if (creatorSummaryNode) {
        creatorSummaryNode.textContent = creatorName;
    }

    // 상단 요약 탭을 가볍게 순차 등장시킵니다.
    summaryTabs.forEach((tab, index) => {
        tab.animate(
            [
                { opacity: 0, transform: "translateY(14px)" },
                { opacity: 1, transform: "translateY(0)" }
            ],
            {
                duration: 380,
                delay: index * 60,
                fill: "forwards",
                easing: "ease-out"
            }
        );
    });

    // 상단 요약 수치를 누르면 관련 섹션으로 이동하고 활성 상태를 바꿉니다.
    summaryTabs.forEach((tab) => {
        const link = tab.querySelector(".tab_link");

        if (!link) {
            return;
        }

        link.addEventListener("click", (event) => {
            event.preventDefault();

            const targetSelector = link.dataset.summaryTarget;
            const targetSection = targetSelector ? document.querySelector(targetSelector) : null;

            summaryTabs.forEach((summaryTab) => summaryTab.classList.remove("tab_on"));
            tab.classList.add("tab_on");

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // 그래프 범례를 클릭하면 해당 항목의 선형 그래프만 보이게 전환합니다.
    chartButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedSeries = button.dataset.chartSeries;

            chartButtons.forEach((item) => {
                item.classList.toggle("is-active", item === button);
            });

            chartLines.forEach((line) => {
                line.classList.toggle("is-active", line.dataset.chartLine === selectedSeries);
            });

            chartPoints.forEach((points) => {
                points.classList.toggle("is-active", points.dataset.chartPoints === selectedSeries);
            });
        });
    });

    // 본문 섹션과 패널도 아래에서 자연스럽게 올라오게 처리합니다.
    panels.forEach((panel, index) => {
        panel.animate(
            [
                { opacity: 0, transform: "translateY(18px)" },
                { opacity: 1, transform: "translateY(0)" }
            ],
            {
                duration: 420,
                delay: 120 + index * 70,
                fill: "forwards",
                easing: "ease-out"
            }
        );
    });
});
