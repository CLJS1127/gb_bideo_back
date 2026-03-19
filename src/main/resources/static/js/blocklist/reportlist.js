document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll("[data-tab-target]");
    const panels = document.querySelectorAll(".tabPanel");
    const menuButtons = document.querySelectorAll("[data-menu-button]");
    const menuPanels = document.querySelectorAll(".menuPanel");

    const closeAllMenus = () => {
        menuButtons.forEach((button) => {
            button.setAttribute("aria-expanded", "false");
            const panel = button.nextElementSibling;

            if (panel) {
                panel.hidden = true;
            }
        });
    };

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const targetId = tab.getAttribute("data-tab-target");

            tabs.forEach((item) => {
                const isActive = item === tab;
                item.classList.toggle("is-active", isActive);
                item.setAttribute("aria-selected", String(isActive));
            });

            panels.forEach((panel) => {
                panel.classList.toggle("is-hidden", panel.id !== targetId);
            });

            closeAllMenus();
        });
    });

    menuButtons.forEach((button) => {
        const panel = button.nextElementSibling;
        if (!button || !panel) {
            return;
        }

        panel.hidden = true;
        button.setAttribute("aria-expanded", "false");

        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = button.getAttribute("aria-expanded") === "true";

            closeAllMenus();

            if (isOpen) {
                return;
            }

            button.setAttribute("aria-expanded", "true");
            panel.hidden = false;
        });

        panel.addEventListener("click", (event) => {
            event.stopPropagation();
        });

        panel.querySelectorAll("button").forEach((itemButton) => {
            itemButton.addEventListener("click", () => {
                // "취소하기" 클릭 시 해당 신고 내역 행만 제거한다.
                if (itemButton.textContent.trim() === "취소하기") {
                    const reportRow = itemButton.closest("tr");

                    if (reportRow) {
                        reportRow.remove();
                    }

                    if (typeof BideoSnackbar !== "undefined") {
                        BideoSnackbar.show("신고가 취소되었습니다.", "info");
                    }
                }

                closeAllMenus();
            });
        });
    });

    menuPanels.forEach((panel) => {
        panel.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    });

    document.addEventListener("click", closeAllMenus);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeAllMenus();
        }
    });
});
