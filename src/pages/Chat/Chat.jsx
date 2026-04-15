import React from "react";
import { useOutletContext } from "react-router-dom";
import { useChatRoom } from "./hooks/useChatRoom";
import MessageInput from "./components/MessageInput";
import ChatContent from "./components/ChatContent";
import ChatSidebar from "./components/ChatSidebar";

const Chat = () => {
  const { socket, user, notifications, handleMarkMessagesAsRead } =
    useOutletContext();

  const { chat_sidebar, chat_content, message_input } = useChatRoom(
    socket,
    user
  );
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full gap-8">
      <ChatSidebar
        {...chat_sidebar}
        unreadChatNotifications={notifications.chat}
        handleMarkMessagesAsRead={handleMarkMessagesAsRead}
      />
      <div className="flex w-full flex-col gap-8 overflow-hidden">
        <ChatContent {...chat_content} />
        {chat_content.selectedChatUserID && <MessageInput {...message_input} />}
      </div>
    </div>
  );
};

export default Chat;
