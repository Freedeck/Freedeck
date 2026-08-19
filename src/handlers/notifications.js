const NotificationManager = require("@managers/notifications");
const eventNames = require("@handlers/eventNames");

/**
  * Send latest notification to Freedeck Client.
  * @param {Object} notification Notification data for Freedeck Client to parse.
*/
async function sendNotification(notification, socket, io) {
  if (notification.sender === "handoff-api") {
    if (notification.data.startsWith("hid.s ")) {
      const requestId = notification.data.split("hid.s ")[1].split(" |")[0];
      const requestData = JSON.parse(
        notification.data.split(`hid.s ${requestId} |`)[1],
      );
      switch (requestId) {
        case "reload-plugins": {
          io.emit(eventNames.default.reload);
          break;
        }
        case "notify": {
          socket.emit(eventNames.default.notif, requestData);
        }
      }
    }
    return;
  }
  socket.emit(eventNames.default.notif, notification);
}

module.exports = {
  name: "Notifications",
  id: "builtin.notifications",
  exec: ({ socket, io, clients }) => {
    const notifListener = (notification) => {
      sendNotification(notification, socket, io)
    }

    socket.sendNotif = (n) => {notifListener(n);};
    NotificationManager.on("newNotification", notifListener);
    socket.on("disconnect", () => {
      const index = clients.indexOf(socket);
      if (index !== -1) {
        NotificationManager.removeListener("newNotification", notifListener);
      }
    });
  }
}