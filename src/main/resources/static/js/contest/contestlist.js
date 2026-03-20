window.onload = () => {
    var contestCards = document.querySelectorAll(".contest-item");

    if (!contestCards.length) {
        return;
    }

    contestCards.forEach(function (card) {
        card.style.cursor = "pointer";

        card.addEventListener("click", function () {
            window.location.href = "/contest/detail";
        });
    });
};
