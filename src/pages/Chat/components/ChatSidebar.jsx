import React from "react";
import { Button } from "@/components/ui/button";
import ChatCard from "./ChatCard";

const ChatSidebar = ({
  userChattersData,
  userChattersLoading,
  userChattersError,
  handleSwitchConversation,
  selectedChatUserID,
  unreadChatNotifications,
  handleMarkMessagesAsRead,
}) => {
  const chatters = userChattersData?.chatters ?? [];
  return (
    <div
      id="Chat Sidebar"
      className="bg-card flex h-full w-72 flex-col rounded-xl"
    >
      <div className="m-4 flex items-center justify-between">
        <div className="text-xl">Chats</div>
        <Button asChild>
          <div className="text-xl">+</div>
        </Button>
      </div>
      <div
        className="no-scrollbar mx-2 my-4 flex flex-1 flex-col items-center
          gap-4 overflow-x-hidden overflow-y-auto"
      >
        {userChattersError ? (
          <p>error: {userChattersError}</p>
        ) : userChattersLoading || userChattersData === null ? (
          <p>Loading Contacts</p>
        ) : chatters?.length === 0 ? (
          <p>No contacts yet</p>
        ) : (
          chatters.map((chatter) => {
            return (
              <ChatCard
                key={chatter?.user_id}
                chatter={chatter}
                handleSwitchConversation={handleSwitchConversation}
                selectedChatUserID={selectedChatUserID}
                unreadChatNotifications={unreadChatNotifications}
                handleMarkMessagesAsRead={handleMarkMessagesAsRead}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatSidebar);
