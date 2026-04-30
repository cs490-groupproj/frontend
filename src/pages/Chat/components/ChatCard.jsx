import React from "react";

const ChatCard = ({
  chatter,
  handleSwitchConversation,
  selectedChatUserID,
  unreadChatNotifications,
  handleMarkMessagesAsRead,
}) => {
  const chatterID = chatter?.user_id;
  return (
    <div
      onClick={() => {
        handleSwitchConversation(chatterID);
        handleMarkMessagesAsRead(chatterID);
      }}
      className={`hover:bg-accent hover:ring-ring border-border flex w-full
        flex-nowrap items-center justify-between gap-2 rounded-lg border-1 p-2
        hover:ring-1 hover:ring-inset
        ${chatterID === selectedChatUserID ? "bg-secondary" : "bg-transparent"}`}
    >
      <div>{/*profile picture here eventually???*/}</div>

      <div className="min-w-0 flex-1 truncate">
        {chatter?.first_name} {chatter?.last_name}
      </div>
      {unreadChatNotifications?.[chatterID]?.count > 0 && (
        <div
          className="bg-primary text-primary-foreground flex h-6 min-w-6
            items-center justify-center rounded-full px-2 text-xs font-bold"
        >
          {unreadChatNotifications?.[chatterID]?.count > 99
            ? "99+"
            : unreadChatNotifications?.[chatterID]?.count}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatCard);
