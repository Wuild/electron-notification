const EventEmitter = require("events");
const {BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const {filter, forEach} = require("lodash");
let notifications = [];
let queue = [];

let maxNotifications = 3;

ipcMain.on("notification.click", function (sender, data) {
    notifications.forEach(function (note) {
        if (data === note.window.id) {
            note.emit("click");
        }
    });
});

ipcMain.on("notification.dblclick", function (sender, data) {
    notifications.forEach(function (note) {
        if (data === note.window.id) {
            note.emit("dblclick");
        }
    });
});

module.exports = class Notification extends EventEmitter {
    constructor(options) {
        super();

        this.options = Object.assign({
            title: false,
            body: false,
            position: "top-right",
            background: "#2d3135",
            theme: "light",
            width: 560,
            icon: path.resolve(__dirname, 'icon.svg'),
            iconPosition: "left",
            timeout: false,
            sound: false,
            bottom: 5,
            style: {
                base: {
                    body: {
                        display: "flex",
                        flexDirection: "row",
                        flex: 1,
                        minHeight: "1px",
                        height: "100%"
                    },

                    close: {
                        position: "absolute",
                        zIndex: 10,
                        right: "5px",
                        top: 0,
                        padding: "7px"
                    },

                    sidebar: {
                        display: "flex",
                        width: "150px",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        flexGrow: 0,
                        padding: "17px"
                    },

                    container: {
                        flex: 1,
                        minHeight: "1px",
                        padding: "15px"
                    },

                    title: {
                        padding: 0,
                        margin: 0
                    },
                    content: {
                        overflow: "visible"
                    }
                },

                dark: {
                    sidebar: {
                        backgroundColor: "#262a2e"
                    },
                    container: {
                        backgroundColor: "#2d3135",
                        color: "hsla(0, 0%, 100%, .6)",
                    },
                    close: {
                        color: "hsla(0, 0%, 100%, .6)",
                    }
                },

                light: {
                    sidebar: {
                        backgroundColor: "#f6f6f6"
                    },
                    container: {
                        backgroundColor: "#fff",
                        color: "#2c2c2c",
                    },
                    close: {
                        color: "#000",
                    }
                }
            }
        }, options);

        this.position = this.options.position;

        this.window = new BrowserWindow({
            show: false,
            width: this.options.width,
            height: 30,
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
            focusable: false,
            webPreferences: {
                nodeIntegration: true,
                preload: path.resolve(__dirname, 'preload.js')
            }
        });

        this.window.on("show", function () {
            this.emit("show");
        }.bind(this));

        this.window.on("resize", function () {
            this._calculatePosition(this.position);
            this.emit("resize");
        }.bind(this));

        this.window.on("close", function () {
            notifications.splice(notifications.indexOf(this), 1);

            if (queue.length > 0) {
                queue[0].show();
                queue.splice(0, 1);
            }

            this._calculatePosition(this.position);
            this.emit("close");
        }.bind(this));
    }

    static setMaxNotifications(amount) {
        maxNotifications = amount;
    }

    /**
     * Close all notifications
     */
    static closeAll() {
        let windowsToClose = [];
        queue.length = 0;
        // Have to store the windows in another array due to array manipulation when the notification closes
        forEach(notifications, function (note) {
            windowsToClose.push(note);
        });

        forEach(windowsToClose, function (note) {
            note.close();
        });
    }

    /**
     * Calculate all notification positions at "position"
     * @param position
     * @private
     */
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

    /**
     * Close the notification
     */
    close() {
        if (!this.window.isDestroyed())
            this.window.close();
    }

    /**
     * Show the notification
     */
    show() {
        // If notification list is full add to queue
        if (notifications.length < maxNotifications) {
            // Add notification instance to array
            notifications.push(this);
            this.window.loadFile(path.resolve(__dirname, 'notification.html'));

            this.window.webContents.on('did-finish-load', function () {
                this.window.webContents.send("setObject", this.options);
                this.window.show();
            }.bind(this));

            // Add close timeout of time is set.
            if (this.options.timeout)
                setTimeout(function () {
                    if (this.window && !this.window.isDestroyed())
                        this.window.close();
                }.bind(this), this.options.timeout);
        } else {
            queue.push(this);
        }
    }

};