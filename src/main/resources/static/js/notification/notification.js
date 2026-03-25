document.addEventListener("DOMContentLoaded", () => {
    const backButton = document.querySelector(".back-button");
    const pauseToggle = document.querySelector('.notification-inline input[type="checkbox"]');
    const sections = document.querySelectorAll(".notification-group:not(.notification-inline)");

    if (backButton && !backButton.dataset.bound) {
        backButton.dataset.bound = "true";
        backButton.addEventListener("click", () => {
            if (window.history.length > 1) {
                window.history.back();
                return;
            }
            window.location.href = "/";
        });
    }

    const FIELD_MAP = {
        follow: "followNotify",
        likes_and_wishlist: "likeBookmarkNotify",
        comments_and_mentions: "commentMentionNotify",
        auction: "auctionNotify",
        payment_and_settlement: "paymentSettlementNotify",
        contest: "contestNotify"
    };

    function loadSettings() {
        fetch("/api/notifications/settings")
            .then(res => {
                if (!res.ok) throw new Error("failed to load settings");
                return res.json();
            })
            .then(data => {
                if (pauseToggle) {
                    pauseToggle.checked = data.pauseAll === true;
                    updateSectionsDim(data.pauseAll === true);
                }

                Object.entries(FIELD_MAP).forEach(([radioName, field]) => {
                    const value = data[field] === false ? "off" : "on";
                    const radio = document.querySelector('input[name="' + radioName + '"][value="' + value + '"]');
                    if (radio) radio.checked = true;
                });
            })
            .catch(() => {});
    }

    function saveSettings() {
        const body = {
            pauseAll: pauseToggle ? pauseToggle.checked : false
        };

        Object.entries(FIELD_MAP).forEach(([radioName, field]) => {
            const checked = document.querySelector('input[name="' + radioName + '"]:checked');
            body[field] = checked ? checked.value === "on" : true;
        });

        fetch("/api/notifications/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        }).catch(() => {});
    }

    function updateSectionsDim(paused) {
        sections.forEach(section => {
            section.style.opacity = paused ? "0.4" : "";
            section.style.pointerEvents = paused ? "none" : "";
        });
    }

    if (pauseToggle) {
        pauseToggle.addEventListener("change", () => {
            updateSectionsDim(pauseToggle.checked);
            saveSettings();
        });
    }

    document.querySelectorAll('.notification-group input[type="radio"]').forEach(radio => {
        radio.addEventListener("change", () => {
            saveSettings();
        });
    });

    loadSettings();
});
