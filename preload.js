const {ipcRenderer, remote} = require("electron");

function resizeWindow() {
    let body = document.body,
        html = document.documentElement;

    let el = document.getElementById("container");
    let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    let pt = parseInt(window.getComputedStyle(el, null).getPropertyValue('padding-top'));

    height += (pt);

    remote.getCurrentWindow().setSize(remote.getCurrentWindow().getBounds().width, height);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("close").addEventListener("click", function () {
        remote.getCurrentWindow().close();
    });

    document.getElementById("body").addEventListener("click", function () {
        ipcRenderer.send("notification.click", remote.getCurrentWindow().id);
    });
});

ipcRenderer.on("setTitle", function (sender, data) {
    let el = document.createElement("h3");
    el.id = "title";
    el.innerText = data;

    document.getElementById("container").prepend(el);
    resizeWindow();
});

ipcRenderer.on("setIcon", function (sender, data) {

    let sidebar = document.createElement("div");
    sidebar.id = "sidebar";

    let el = document.createElement("img");
    el.src = data;
    sidebar.appendChild(el);
    document.getElementById("body").prepend(sidebar);

    resizeWindow();
});

ipcRenderer.on("setContent", function (sender, data) {
    document.getElementById("content").innerHTML = data;
    resizeWindow();
});

ipcRenderer.on("setTheme", function (sender, data) {
    document.body.classList.add("theme-" + data)
});