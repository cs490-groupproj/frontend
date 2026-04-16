import React from "react";
import { Button } from "@/components/ui/button";
import ChatCard from "./ChatCard";

const ChatSidebar = ({
  userCoachesError,
  userCoachesLoading,
  userCoachesData,
  handleSwitchConversation,
  selectedChatUserID,
  unreadChatNotifications,
  handleMarkMessagesAsRead,
}) => {
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
        {userCoachesError ? (
          <p>error: {userCoachesError}</p>
        ) : userCoachesLoading ? (
          <p>Loading Contacts</p>
        ) : (
          userCoachesData?.coaches.map((coach) => {
            return (
              <ChatCard
                key={coach.id}
                coach={coach}
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
