import React from "react";

const ChatCard = ({
  coach,
  handleSwitchConversation,
  selectedChatUserID,
  unreadChatNotifications,
  handleMarkMessagesAsRead,
}) => {
  const coachID = coach.coach_user_id;
  return (
    <div
      onClick={() => {
        handleSwitchConversation(coachID);
        handleMarkMessagesAsRead(coachID);
      }}
      className={`hover:bg-accent hover:ring-ring border-border flex w-full
        flex-nowrap items-center justify-between gap-2 rounded-lg border-1 p-2
        hover:ring-1 hover:ring-inset
        ${coachID === selectedChatUserID ? "bg-secondary" : "bg-transparent"}`}
    >
      <div>{/*profile picture here eventually???*/}</div>

      <div className="min-w-0 flex-1 truncate">
        {coach.first_name} {coach.last_name}
      </div>
      {unreadChatNotifications?.[coachID]?.count > 0 && (
        <div
          className="bg-primary text-primary-foreground flex h-6 min-w-6
            items-center justify-center rounded-full px-2 text-xs font-bold"
        >
          {unreadChatNotifications?.[coachID]?.count > 99
            ? "99+"
            : unreadChatNotifications?.[coachID]?.count}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatCard);
