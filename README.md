# electron-notification
A cross platform notification plugin for electron  
It uses BrowserWindows for the notifications, it also resizes the height of the window dynamically depending of the content size  
The notifications requires the electron screen api which cannot be run before [app.ready](https://electronjs.org/docs/api/app#event-ready)

## TODO
* Write a better README
* Implement custom styles
* Left and right icons
* Sound

## Installation
Install with npm:
```
npm install --save @wuild/electron-notification
```

```javascript
const Notification = require("@wuild/electron-notification");
```

#### Themes
![dark](./images/notification-dark.png)

![light](./images/notification-light.png)

#### Options
Name | type | default | description | alternatives
---:| --- | ---| ---| ---
title | String | -- | Notification title
body | String | -- | Notification body (can be html)
position | String | top-right | Notification position | top-left, top-right, bottom-left, bottom-right
theme | String | light | Notification theme | light, dark
width | Integer | 560 | Notification width
icon | String | default icon | Notification icon
timeout | Integer | -- | Close notification after milliseconds
bottom | Integer | 15 | Margin between notifications

#### Events
Name |  description
---:| ---
show | When the notification is shown
close | When the notification is closed
click | When the notification is clicked
dblclick | When the notification is double clicked
resize | When the notification is resized

#### Methods
Name |  description
---:| ---
show | Create and open the notification
close | Close the notification
closeAll | (Static) Close all open notification

#### Example
```javascript
const {app} = require("electron");
const Notification = require("@wuild/electron-notification");

app.on("ready", function () {
    let note = new Notification({
        theme: "light",
        title: "This is a notification",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce finibus eget risus sed porta. Cras vehicula nunc euismod, pellentesque ligula gravida, gravida ante. Etiam dapibus, eros at aliquet tincidunt."
    });
    
    note.on("close", function(){
       console.log("Notification has been closed"); 
    });
    
    note.show();
    
    let note2 = new Notification({
        theme: "dark",
        title: "This is a notification",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce finibus eget risus sed porta. Cras vehicula nunc euismod, pellentesque ligula gravida, gravida ante. Etiam dapibus, eros at aliquet tincidunt."
    });
    
    note2.on("click", function(){
       console.log("Notification has been clicked"); 
    });
    
    note2.on("dblclick", function(){
        console.log("Notification has been doubled clicked"); 
    });
    
    note2.show();
});
```


#### License
Copyright © 2018, [Wuild](https://github.com/Wuild) Released under the [MIT license](https://opensource.org/licenses/MIT).