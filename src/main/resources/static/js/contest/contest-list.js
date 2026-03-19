window.onload = () => {
    const selectedFilters = { region: null, field: null };

    const filterRegion = document.getElementById("filterRegion");
    const filterField = document.getElementById("filterField");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    if (filterRegion) {
        filterRegion.addEventListener("click", () =>
            togglePanel("regionPanel", "filterRegion"),
        );
    }
    if (filterField) {
        filterField.addEventListener("click", () => togglePanel("fieldPanel", "filterField"));
    }

    function togglePanel(panelId, triggerId) {
        const panel = document.getElementById(panelId);
        const trigger = document.getElementById(triggerId);
        if (!panel || !trigger) return;
        const isOpen = panel.classList.contains("open");
        closeAll();
        if (!isOpen) {
            panel.classList.add("open");
            trigger.classList.add("active");
        }
    }

    function closeAll() {
        document
            .querySelectorAll(".dropdown-panel")
            .forEach((p) => p.classList.remove("open"));
        document
            .querySelectorAll(".filter-item")
            .forEach((i) => i.classList.remove("active"));
    }

    document.addEventListener("click", function (e) {
        if (
            !e.target.closest(".filter-item") &&
            !e.target.closest(".dropdown-panel")
        ) {
            closeAll();
        }
    });

    document.querySelectorAll(".dropdown-option").forEach((opt) => {
        opt.addEventListener("click", function () {
            const target = this.dataset.target;
            const value = this.dataset.value;
            document
                .querySelectorAll(`[data-target="${target}"]`)
                .forEach((o) => o.classList.remove("selected"));
            this.classList.add("selected");
            selectedFilters[target] = value;
            const labelId = target === "region" ? "regionLabel" : "fieldLabel";
            const label = document.getElementById(labelId);
            if (label) {
                label.textContent = value;
                label.classList.add("selected");
            }
            closeAll();
            updateCount();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", updateCount);
    }

    function updateCount() {
        let count = 0;
        if (selectedFilters.region) count++;
        if (selectedFilters.field) count++;
        if (searchInput && searchInput.value.trim()) count++;
        const selectedCount = document.getElementById("selectedCount");
        if (selectedCount) {
            selectedCount.textContent = count;
        }
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", function () {
            const keyword = searchInput ? searchInput.value.trim() : "";
            if (!keyword && !selectedFilters.region && !selectedFilters.field) {
                alert("검색조건을 설정해 주세요.");
                return;
            }
            console.log("검색:", { ...selectedFilters, keyword });
        });
    }

    // 북마크 토글
    document.querySelectorAll(".card-bookmark").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            this.classList.toggle("active");
        });
    });
}
