window.onload = () => {
    function toggleScrap(btn) {
        btn.classList.toggle("active");
    }

    function copyLink() {
        navigator.clipboard.writeText(window.location.href).then(function () {
            alert("링크가 복사되었습니다.");
        });
    }
}
