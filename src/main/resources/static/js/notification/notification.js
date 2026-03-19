document.addEventListener("DOMContentLoaded", () => {
    const backButton = document.querySelector(".back-button");

    if (!backButton || backButton.dataset.bound) {
        return;
    }

    backButton.dataset.bound = "true";

    backButton.addEventListener("click", () => {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        window.location.href = "/";
    });
});
