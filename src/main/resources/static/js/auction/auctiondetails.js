document.addEventListener("DOMContentLoaded", () => {
    const actionLinks = document.querySelectorAll(".navigation_menu .menu_item");
    const primaryButton = document.querySelector(".order_footer .display_button");

    actionLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            // Keep menu actions in-page without hash jump.
            event.preventDefault();
            if (link.closest(".remove_order")) {
                return;
            }

            actionLinks.forEach((item) => item.classList.remove("is-active"));
            link.classList.add("is-active");
        });
    });

    if (primaryButton) {
        primaryButton.addEventListener("click", () => {
            primaryButton.classList.add("is-clicked");
            setTimeout(() => primaryButton.classList.remove("is-clicked"), 180);
        });
    }
});
