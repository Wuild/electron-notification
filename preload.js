const {ipcRenderer, remote} = require("electron");
let contentSound;
let objectData;

function resizeWindow() {
    let body = document.body,
        html = document.documentElement;

    let el = document.getElementById("container");
    let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    let pt = parseInt(window.getComputedStyle(el, null).getPropertyValue('padding-top'));
    height += (pt);
    remote.getCurrentWindow().setSize(remote.getCurrentWindow().getBounds().width, height);
}

function applyElementStyle(style) {
    for (let target in style) {
        try {
            let el = document.getElementById(target);
            for (let attr in style[target]) {
                el.style[attr] = style[target][attr]
            }
        } catch (e) {

        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("close").addEventListener("click", function () {
        remote.getCurrentWindow().close();
    });

    let singelClick = function () {
        ipcRenderer.send("notification.click", remote.getCurrentWindow().id);
    };

    let dblClick = function () {
        ipcRenderer.send("notification.dblclick", remote.getCurrentWindow().id);
    };

    let makeDoubleClick = function (e) {

        let clicks = 0,
            timeout;

        return function (e) {
            clicks++;
            if (clicks === 1) {
                timeout = setTimeout(function () {
                    singelClick(e);
                    clicks = 0;
                }, 200);
            } else {
                clearTimeout(timeout);
                dblClick(e);
                clicks = 0;
            }
        };
    };

    document.getElementById("body").addEventListener("click", makeDoubleClick());
});

ipcRenderer.on("setObject", function (sender, data) {
    if (data.title) {
        let el = document.createElement("h3");
        el.id = "title";
        el.innerText = data.title;

        document.getElementById("container").prepend(el);
    }

    if (data.icon) {
        let sidebar = document.createElement("div");
        sidebar.id = "sidebar";

        let el = document.createElement("img");
        el.src = data.icon;
        sidebar.appendChild(el);
        switch (data.iconPosition) {
            default:
            case "left":
                document.getElementById("body").prepend(sidebar);
                break;

            case "right":
                document.getElementById("body").appendChild(sidebar);
                break;
        }
    }

    document.getElementById("content").innerHTML = data.body;
    document.body.classList.add("theme-" + data.theme);
    contentSound = data.sound;
    objectData = data;

    applyElementStyle(objectData.style.base);
    applyElementStyle(objectData.style[objectData.theme]);

    resizeWindow();
});

remote.getCurrentWindow().on("show", function () {
    if (contentSound) {
        let audio = new Audio(contentSound);
        audio.play();
    }
});