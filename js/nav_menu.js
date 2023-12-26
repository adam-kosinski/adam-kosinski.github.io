//stuff for the side nav menu on small screens
function toggleSideNav() {
    let header = document.querySelector("#header");
    header.classList.toggle("nav-open");
    let visible = header.classList.contains("nav-open");
    document.querySelectorAll("#header nav > *").forEach(el => el.setAttribute("tabindex", visible ? "0" : "-1"));
}
window.addEventListener("resize", function () { document.querySelector("#header").classList.remove("nav-open"); });