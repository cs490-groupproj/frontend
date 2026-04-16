import React from "react";
import NotificationCard from "./components/NotificationCard";

const Notifications = ({ notifications }) => {
  if (!notifications) {
    return null;
  }
  const chatAlerts = Object.keys(notifications.chat).map((key) => ({
    id: key,
    ...notifications.chat[key],
  }));

  const otherAlerts = [
    ...notifications.requests,
    ...notifications.workouts,
    ...notifications.system,
  ];
  const allAlerts = [...chatAlerts, ...otherAlerts];

  return (
    <div className="no-scrollbar space-y-2 overflow-y-auto px-6 pb-4">
      {allAlerts.map((alert) => (
        <NotificationCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
};

export default Notifications;
