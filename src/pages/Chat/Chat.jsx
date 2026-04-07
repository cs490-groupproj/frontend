import React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ChatCard from "./components/ChatCard";
import { useOutletContext } from "react-router-dom";

const Chat = () => {
  const { socket } = useOutletContext();
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join", { other_id: "985FF7C5-BE2E-49F8-8F13-E33E2257BEC8" });

    socket.on("new_message", (newMessage) => {
      setChatHistory((prevHistory) => [...prevHistory, newMessage]);
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full gap-8">
      <div id="Chat Selection" className="bg-card h-full w-60 rounded-xl p-4">
        <div className="flex items-center justify-between pb-4">
          <div className="text-xl">Chats</div>
          <Button asChild>
            <div className="text-xl">+</div>
          </Button>
        </div>
        <ChatCard />
        <ChatCard />
        <ChatCard />
        <ChatCard />
      </div>
      <div className="flex w-full flex-col gap-8 overflow-hidden">
        <div
          className="bg-card no-scrollbar flex-1 overflow-y-auto rounded-xl p-4"
          id="Chat Messages"
        >
          {chatHistory.map((msg, index) => (
            <div key={index}>{msg.message}</div>
          ))}
        </div>
        <div id="Chat Toolbar" className="flex justify-between">
          <p>message bar</p>
          <Button
            onClick={() => {
              socket.emit("send_message", { message: "hello world" });
            }}
          >
            send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
