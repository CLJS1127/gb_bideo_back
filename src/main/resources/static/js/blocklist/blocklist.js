document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("unblock-modal");
    const openButtons = document.querySelectorAll("[data-open-unblock]");
    const closeButtons = document.querySelectorAll("[data-close-modal]");
    const confirmButton = document.querySelector("[data-confirm-unblock]");
    const modalUsername = document.getElementById("modal-username");
    const modalUsernameCopy = document.getElementById("modal-username-copy");
    let currentButton = null;
    let currentRow = null;

    if (!modal || !openButtons.length) {
        return;
    }

    const closeModal = () => {
        modal.hidden = true;
        document.body.style.overflow = "";
        currentButton?.focus();
    };

    const openModal = (button) => {
        const username = button.getAttribute("data-open-unblock") || "";

        if (modalUsername) {
            modalUsername.textContent = username;
        }

        if (modalUsernameCopy) {
            modalUsernameCopy.textContent = username;
        }

        currentButton = button;
        currentRow = button.closest(".account-row");
        modal.hidden = false;
        document.body.style.overflow = "hidden";
    };

    openButtons.forEach((button) => {
        button.addEventListener("click", () => openModal(button));
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    confirmButton?.addEventListener("click", () => {
        const nextFocusTarget = currentRow?.nextElementSibling?.querySelector("[data-open-unblock]")
            || currentRow?.previousElementSibling?.querySelector("[data-open-unblock]")
            || document.querySelector(".back-button");

        currentRow?.remove();
        modal.hidden = true;
        document.body.style.overflow = "";
        currentRow = null;
        currentButton = null;
        nextFocusTarget?.focus();

        if (typeof BideoSnackbar !== "undefined") {
            BideoSnackbar.show("차단이 해제되었습니다.", "info");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });
});
