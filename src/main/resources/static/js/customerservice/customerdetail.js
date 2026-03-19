function initCustomerDetailPage() {
    const articleToggles = document.querySelectorAll(".detail-toggle");
    const openInquiryButton = document.querySelector("[data-open-inquiry]");
    const inquiryModal = document.getElementById("inquiry-modal");
    const closeInquiryButtons = document.querySelectorAll("[data-close-inquiry]");
    const inquiryTextarea = document.getElementById("inquiry-textarea");
    const inquiryCount = document.getElementById("inquiry-count");
    const submitInquiryButton = document.querySelector("[data-submit-inquiry]");
    const successToast = document.getElementById("success-toast");
    let toastTimerId = null;

    if (document.body.dataset.customerdetailBound) {
        return;
    }

    document.body.dataset.customerdetailBound = "true";

    const setBodyScrollLock = (locked) => {
        document.body.style.overflow = locked ? "hidden" : "";
    };

    const updateInquiryCount = () => {
        if (!inquiryTextarea || !inquiryCount) {
            return;
        }

        inquiryCount.textContent = String(inquiryTextarea.value.length);
    };

    const closeInquiryModal = () => {
        if (!inquiryModal) {
            return;
        }

        inquiryModal.hidden = true;
        setBodyScrollLock(false);
    };

    const openInquiryModal = () => {
        if (!inquiryModal) {
            return;
        }

        inquiryModal.hidden = false;
        setBodyScrollLock(true);
        updateInquiryCount();
        inquiryTextarea?.focus();
    };

    const showSuccessToast = () => {
        if (!successToast) {
            return;
        }

        successToast.hidden = false;

        if (toastTimerId) {
            window.clearTimeout(toastTimerId);
        }

        toastTimerId = window.setTimeout(() => {
            successToast.hidden = true;
            toastTimerId = null;
        }, 3000);
    };

    articleToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            const article = toggle.closest(".detail-article");
            const panel = article?.querySelector(".detail-panel");

            if (!article || !panel) {
                return;
            }

            const isOpen = article.classList.contains("is-open");
            article.classList.toggle("is-open", !isOpen);
            toggle.setAttribute("aria-expanded", String(!isOpen));
            panel.hidden = isOpen;
        });
    });

    openInquiryButton?.addEventListener("click", openInquiryModal);

    closeInquiryButtons.forEach((button) => {
        button.addEventListener("click", closeInquiryModal);
    });

    inquiryTextarea?.addEventListener("input", updateInquiryCount);

    submitInquiryButton?.addEventListener("click", () => {
        if (inquiryTextarea) {
            inquiryTextarea.value = "";
        }

        updateInquiryCount();
        closeInquiryModal();
        showSuccessToast();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && inquiryModal && !inquiryModal.hidden) {
            closeInquiryModal();
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCustomerDetailPage);
} else {
    initCustomerDetailPage();
}
