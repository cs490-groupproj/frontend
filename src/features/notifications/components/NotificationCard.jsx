import React from "react";
import { NOTIFICATION_CONFIG } from "/config";

const NotificationCard = ({ alert }) => {
  const getAlertText = (alert) => {
    switch (alert.type) {
      case "chat_message":
        return `${alert.name} sent you ${alert.count} ${alert.count === 1 ? "message" : "messages"}`;
      default:
        return "You have a notification";
    }
  };

  const config = NOTIFICATION_CONFIG[alert.type] ?? {
    label: "Unknown Notification",
    color: "border-destructive bg-destructive/15",
    text: "text-white",
  };

  return (
    <div
      className={`animate-in fade-in slide-in-from-right-100 rounded-r-lg
        border-l-4 p-3 duration-300 ${config.color}`}
    >
      <p className={`text-xs font-bold uppercase ${config.text}`}>
        {config.label}
      </p>
      <p className="text-sm break-words">{getAlertText(alert)}</p>
    </div>
  );
};

export default NotificationCard;
