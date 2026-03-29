document.addEventListener("DOMContentLoaded", () => {
    const bellButton = document.querySelector('.side-nav__item--updates .side-nav__item-link');
    if (!bellButton) return;

    let panel = null;
    let isOpen = false;
    let pollTimer = null;

    function createBadge() {
        let badge = bellButton.querySelector(".notification-badge");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "notification-badge";
            badge.style.display = "none";
            const iconWrap = bellButton.querySelector(".side-nav__icon-wrap");
            if (iconWrap) {
                iconWrap.style.position = "relative";
                iconWrap.appendChild(badge);
            }
        }
        return badge;
    }

    const badge = createBadge();

    function updateBadge() {
        fetch("/api/notifications/unread-count")
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => {
                const count = data.count || 0;
                if (count > 0) {
                    badge.textContent = count > 99 ? "99+" : count;
                    badge.style.display = "";
                } else {
                    badge.style.display = "none";
                }
            })
            .catch(() => {});
    }

    function timeAgo(dateStr) {
        const now = new Date();
        const date = new Date(dateStr);
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return "방금 전";
        if (diff < 3600) return Math.floor(diff / 60) + "분 전";
        if (diff < 86400) return Math.floor(diff / 3600) + "시간 전";
        if (diff < 604800) return Math.floor(diff / 86400) + "일 전";
        return date.toLocaleDateString("ko-KR");
    }

    function getTargetUrl(item) {
        if (!item.targetType || !item.targetId) return null;
        switch (item.targetType) {
            case "WORK": return "/work/detail/" + item.targetId;
            case "AUCTION": return "/auction/auction-detail/" + item.targetId;
            case "GALLERY": return "/gallery/" + item.targetId;
            case "CONTEST": return "/contest/" + item.targetId;
            case "MEMBER": return "/profile/" + item.targetId;
            default: return null;
        }
    }

    function getNotiIcon(notiType) {
        switch (notiType) {
            case "COMMENT": return "💬";
            case "LIKE": return "❤️";
            case "BOOKMARK": return "🔖";
            case "FOLLOW": return "👤";
            case "BID": return "🔨";
            case "AUCTION_END": return "🏆";
            case "PAYMENT": case "SETTLEMENT": return "💰";
            case "CONTEST_ENTRY": return "🎨";
            default: return "🔔";
        }
    }

    function buildNotificationItem(item) {
        const unreadClass = item.isRead ? "" : " notification-item--unread";
        const avatarSrc = item.senderProfileImage || "";
        const senderName = item.senderNickname || "BIDEO";
        const url = getTargetUrl(item);
        const icon = getNotiIcon(item.notiType);

        let avatarHTML;
        if (avatarSrc) {
            avatarHTML = '<img class="notification-item__avatar" src="' + avatarSrc + '" alt="">';
        } else {
            avatarHTML = '<img class="notification-item__avatar" src="/images/BIDEO_LOGO/BIDEO_favicon.png" alt="">';
        }

        return '<div class="notification-item' + unreadClass + '" data-id="' + item.id + '"'
            + (url ? ' data-url="' + url + '"' : '') + '>'
            + avatarHTML
            + '<div class="notification-item__body">'
            + '<p class="notification-item__message"><strong>' + senderName + '</strong> ' + (item.message || '') + '</p>'
            + '<span class="notification-item__time">' + timeAgo(item.createdDatetime) + '</span>'
            + '</div>'
            + '<button class="notification-item__delete" data-id="' + item.id + '" aria-label="삭제">&times;</button>'
            + '</div>';
    }

    function createPanel() {
        if (panel) return panel;

        panel = document.createElement("div");
        panel.className = "notification-panel";
        panel.innerHTML =
            '<div class="notification-panel__header">'
            + '<h3>알림</h3>'
            + '<button class="notification-panel__read-all">모두 읽음</button>'
            + '</div>'
            + '<div class="notification-panel__list">'
            + '<div class="notification-panel__empty">알림이 없습니다.</div>'
            + '</div>'
            + '<a class="notification-panel__settings" href="/notification">알림 설정</a>';

        const navItem = bellButton.closest(".side-nav__item--updates");
        if (navItem) {
            navItem.style.position = "relative";
            navItem.appendChild(panel);
        } else {
            document.body.appendChild(panel);
        }

        panel.querySelector(".notification-panel__read-all").addEventListener("click", (e) => {
            e.stopPropagation();
            fetch("/api/notifications/read-all", { method: "PATCH" })
                .then(() => {
                    panel.querySelectorAll(".notification-item--unread").forEach(el => {
                        el.classList.remove("notification-item--unread");
                    });
                    updateBadge();
                })
                .catch(() => {});
        });

        panel.addEventListener("click", (e) => {
            e.stopPropagation();

            const deleteBtn = e.target.closest(".notification-item__delete");
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                fetch("/api/notifications/" + id, { method: "DELETE" })
                    .then(() => {
                        const item = deleteBtn.closest(".notification-item");
                        if (item) item.remove();
                        updateBadge();
                        checkEmpty();
                    })
                    .catch(() => {});
                return;
            }

            const item = e.target.closest(".notification-item");
            if (item) {
                const id = item.dataset.id;
                const url = item.dataset.url;

                if (item.classList.contains("notification-item--unread")) {
                    fetch("/api/notifications/" + id + "/read", { method: "PATCH" })
                        .then(() => {
                            item.classList.remove("notification-item--unread");
                            updateBadge();
                        })
                        .catch(() => {});
                }

                if (url) {
                    window.location.href = url;
                }
            }
        });

        return panel;
    }

    function checkEmpty() {
        const list = panel.querySelector(".notification-panel__list");
        const items = list.querySelectorAll(".notification-item");
        let empty = list.querySelector(".notification-panel__empty");
        if (items.length === 0) {
            if (!empty) {
                empty = document.createElement("div");
                empty.className = "notification-panel__empty";
                empty.textContent = "알림이 없습니다.";
                list.appendChild(empty);
            }
            empty.style.display = "";
        } else if (empty) {
            empty.style.display = "none";
        }
    }

    function loadNotifications() {
        fetch("/api/notifications?page=0")
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => {
                const list = panel.querySelector(".notification-panel__list");
                if (data.length === 0) {
                    list.innerHTML = '<div class="notification-panel__empty">알림이 없습니다.</div>';
                    return;
                }
                list.innerHTML = data.map(buildNotificationItem).join("");
            })
            .catch(() => {});
    }

    function togglePanel() {
        createPanel();
        isOpen = !isOpen;
        if (isOpen) {
            panel.classList.add("notification-panel--open");
            loadNotifications();
        } else {
            panel.classList.remove("notification-panel--open");
        }
    }

    bellButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePanel();
    });

    document.addEventListener("click", (e) => {
        if (isOpen && panel && !panel.contains(e.target) && !bellButton.contains(e.target)) {
            isOpen = false;
            panel.classList.remove("notification-panel--open");
        }
    });

    updateBadge();
    pollTimer = setInterval(updateBadge, 30000);
});
