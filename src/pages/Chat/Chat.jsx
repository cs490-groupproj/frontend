import React from "react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "@/components/icons/lucide-send";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import ChatCard from "./components/ChatCard";
import { useOutletContext } from "react-router-dom";
const Chat = () => {
  const { socket, testToken } = useOutletContext();
  const [chatHistory, setChatHistory] = useState([
    {
      sender_id: "985FF7C5-BE2E-49F8-8F13-E33E2257BEC8",
      sender_name: "bob",
      message: "Test Message to test styling",
    },
  ]); //this is in here for test, shouls eventually be useState([])
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef(null);
  const isNewMessage = useRef(false);

  let sendee_id = "985FF7C5-BE2E-49F8-8F13-E33E2257BEC8";
  // let limit = 50;
  // let offset = 0;
  // const {
  //   data: messageHistoryData,
  //   loading: messageHistoryLoading,
  //   error: messageHistoryError,
  // } = useGetFromAPI(
  //   `/api/messages/history?limit=${limit}&offset=${offset}&user_id=${my_id}&other_party_user_id=${sendee_id}`,
  //   null,
  //   testToken
  // );

  const handleSendMessage = () => {
    if (messageText.trim() === "") {
      return;
    }
    socket.emit("send_message", {
      message: messageText,
    });
    setMessageText("");
  };

  useEffect(() => {
    //this joins the room and listens for incoming messages
    if (!socket) return;

    //the other id will eventually have to be gotten
    socket.emit("join", { other_id: sendee_id });

    socket.on("new_message", (newMessage) => {
      setChatHistory((prevHistory) => [...prevHistory, newMessage]);
      isNewMessage.current = true;
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket]);

  useEffect(() => {
    //this scrolls to the bottom of the chat when a new message is sent
    if (isNewMessage.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      isNewMessage.current = false;
    }
  }, [chatHistory]);

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
          className="bg-card no-scrollbar flex flex-1 flex-col gap-1
            overflow-x-hidden overflow-y-auto rounded-xl p-4"
          id="Chat Messages"
        >
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`w-fit max-w-[75%] rounded-3xl px-4 py-2 break-words
              whitespace-pre-wrap ${
                msg.sender_id == sendee_id
                  ? `bg-secondary text-secondary-foreground mr-auto
                    rounded-bl-sm`
                  : "bg-primary text-primary-foreground ml-auto rounded-br-sm"
              }`}
            >
              {msg.message}
            </div>
          ))}
          <div ref={scrollRef}></div>
        </div>
        <div id="Chat Toolbar" className="relative">
          <Textarea
            placeholder="Type a message"
            className="no-scrollbar max-h-60 min-h-10 resize-none pr-12"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={() => {
              handleSendMessage();
            }}
            className="absolute right-1 bottom-1 h-8 w-8"
            size="icon"
          >
            <SendIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
