function initCustomerServicePage() {
    const inquiryModal = document.getElementById("inquiry-modal");
    const inquiryOpenButton = document.querySelector("[data-open-inquiry]");
    const inquiryCloseButtons = document.querySelectorAll("[data-close-inquiry]");
    const inquirySubmitButton = document.querySelector("[data-submit-inquiry]");
    const inquiryTextarea = document.getElementById("inquiry-textarea");
    const inquiryCount = document.getElementById("inquiry-count");
    const successToast = document.getElementById("success-toast");
    let successToastTimer = null;

    if (inquiryModal && inquiryOpenButton && !inquiryOpenButton.dataset.bound) {
        const openInquiryModal = () => {
            inquiryModal.hidden = false;
            document.body.style.overflow = "hidden";
            if (inquiryTextarea) {
                inquiryTextarea.focus();
            }
        };

        const closeInquiryModal = () => {
            inquiryModal.hidden = true;
            document.body.style.overflow = "";
            inquiryOpenButton.focus();
        };

        const showSuccessToast = () => {
            inquiryModal.hidden = true;
            document.body.style.overflow = "";

            if (inquiryTextarea) {
                inquiryTextarea.value = "";
            }

            if (inquiryCount) {
                inquiryCount.textContent = "0";
            }

            if (!successToast) {
                inquiryOpenButton.focus();
                return;
            }

            successToast.hidden = false;

            if (successToastTimer) {
                window.clearTimeout(successToastTimer);
            }

            successToastTimer = window.setTimeout(() => {
                successToast.hidden = true;
                inquiryOpenButton.focus();
            }, 3000);
        };

        inquiryOpenButton.dataset.bound = "true";
        inquiryOpenButton.addEventListener("click", openInquiryModal);

        inquiryCloseButtons.forEach((button) => {
            button.addEventListener("click", closeInquiryModal);
        });

        if (inquirySubmitButton) {
            inquirySubmitButton.addEventListener("click", showSuccessToast);
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !inquiryModal.hidden) {
                closeInquiryModal();
            }
        });
    }

    if (inquiryTextarea && inquiryCount && !inquiryTextarea.dataset.bound) {
        const syncCount = () => {
            inquiryCount.textContent = String(inquiryTextarea.value.length);
        };

        inquiryTextarea.dataset.bound = "true";
        syncCount();
        inquiryTextarea.addEventListener("input", syncCount);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCustomerServicePage);
} else {
    initCustomerServicePage();
}
