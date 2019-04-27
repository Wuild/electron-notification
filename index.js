const EventEmitter = require("events");
const {BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const {filter} = require("lodash");
let notifications = [];

ipcMain.on("notification.click", function (sender, data) {
    notifications.forEach(function (note) {
        if (data === note.window.id) {
            note.emit("click");
        }
    });
});

module.exports = class Notification extends EventEmitter {

    constructor(options) {
        super();

        this.options = Object.assign({
            title: undefined,
            body: undefined,
            position: "top-right",
            background: "#2d3135",
            theme: "light",
            width: 560,
            icon: path.resolve(__dirname, 'icon.svg'),
            timeout: undefined,
            bottom: 15
        }, options);

        this.position = this.options.position;

        this.window = null;
    }

    static closeAll() {
        notifications.forEach(function (note) {
            if (note.window && !note.window.isDestroyed())
                note.window.close();
        });
    }

    _calculatePosition(position) {
        let {screen} = require("electron");

        this.workArea = screen.getPrimaryDisplay().workAreaSize;

        let y = 0;
        filter(notifications, {position: position}).forEach(function (note, index) {
            switch (this.options.position) {
                default:
                case "bottom-right":
                    y += note.window.getBounds().height + (index > 0 ? this.options.bottom : 0);
                    note.window.setPosition((this.workArea.width - this.window.getBounds().width), (this.workArea.height - y));
                    break;

                case "bottom-left":
                    y += note.window.getBounds().height + (index > 0 ? this.options.bottom : 0);
                    note.window.setPosition((0), (this.workArea.height - y));
                    break;

                case "top-right":
                    note.window.setPosition((this.workArea.width - this.window.getBounds().width), (y));
                    y += note.window.getBounds().height + this.options.bottom;
                    break;

                case "top-left":
                    note.window.setPosition(0, y);
                    y += note.window.getBounds().height + this.options.bottom;
                    break;
            }

        }.bind(this));
    }

    close() {
        this.window.close();
    }

    show() {

        this.window = new BrowserWindow({
            show: false,
            width: this.options.width,
            height: 100,
            x: 0,
            y: 0,
            acceptFirstMouse: true,
            backgroundColor: this.options.background,
            frame: false,
            skipTaskbar: true,
            alwaysOnTop: true,
            movable: false,
            transparent: true,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                preload: path.resolve(__dirname, 'preload.js')
            }
        });

        notifications.push(this);

        this.window.loadFile(path.resolve(__dirname, 'notification.html'));

        this.window.webContents.on('did-finish-load', function () {
            this.window.webContents.send("setTheme", this.options.theme);
            if (this.options.icon)
                this.window.webContents.send("setIcon", this.options.icon);

            if (this.options.title)
                this.window.webContents.send("setTitle", this.options.title);

            if (this.options.body)
                this.window.webContents.send("setContent", this.options.body);

            this.window.show();
        }.bind(this));

        this.window.on("show", function () {
            this.emit("show");
        }.bind(this));

        this.window.on("resize", function () {
            this._calculatePosition(this.position);
            this.emit("resize");
        }.bind(this));

        this.window.on("close", function () {
            notifications.splice(notifications.indexOf(this), 1);
            this._calculatePosition(this.position);
            this.emit("close");
        }.bind(this));

        if (this.options.timeout !== undefined)
            setTimeout(function () {
                if (this.window && !this.window.isDestroyed())
                    this.window.close();
            }.bind(this), this.options.timeout);

    }

};