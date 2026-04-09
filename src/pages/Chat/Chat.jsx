import React from "react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import ChatCard from "./components/ChatCard";
import { useOutletContext } from "react-router-dom";
import MessageInput from "./components/MessageInput";
import ChatContent from "./components/ChatContent";

const Chat = () => {
  let sendToID = "985FF7C5-BE2E-49F8-8F13-E33E2257BEC8";

  let limit = 50;
  let offset = 0;

  const { socket, testToken } = useOutletContext();

  const [chatHistory, setChatHistory] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messageHistoryURI, setMessageHistoryURI] = useState(
    `/messages/history?limit=${limit}&offset=${offset}&other_party_user_id=${sendToID}`
  );

  const scrollRef = useRef(null);
  const isNewMessageRef = useRef(false);
  const isFirstLoadRef = useRef(true);
  const isLoadingOlderMessagesRef = useRef(false);
  const messageBufferRef = useRef([]); //stores messages that are received on page load
  const chatMessageContainerRef = useRef(null);
  const savedScrollHeightRef = useRef(null);

  const {
    data: messageHistoryData,
    loading: messageHistoryLoading,
    error: messageHistoryError,
  } = useGetFromAPI(messageHistoryURI, null, testToken);

  //ensures that a message has content and is not just whitespace
  const handleSendMessage = () => {
    if (messageText.trim() === "") {
      return;
    }
    socket.emit("send_message", {
      message: messageText,
    });
    setMessageText("");
  };

  //loads more messages when the user triggers it
  const loadMessageHistory = () => {
    if (messageHistoryLoading) {
      return;
    }

    isLoadingOlderMessagesRef.current = true;

    const currOffset = (chatHistory || []).length;
    setMessageHistoryURI(
      `/messages/history?limit=${limit}&offset=${currOffset}&other_party_user_id=${sendToID}`
    );
  };

  // const { data: data } = useGetFromAPI(
  //   `/clients/91AABB6B-CFD0-4E88-8423-DCB0839B31C4/coaches`,
  //   null,
  //   testToken
  // );
  // if (data) console.log(data);

  //this joins the chat room with sendee_id gets new messages from the socket
  //and adds them to the prevHistory so they display
  useEffect(() => {
    //this joins the room and listens for incoming messages
    if (!socket) return;

    //the other id will eventually have to be gotten
    socket.emit("join", { other_id: sendToID });

    socket.on("new_message", (newMessage) => {
      setChatHistory((prevHistory) => {
        if (Array.isArray(prevHistory)) {
          isNewMessageRef.current = true; //set this so we get smooth scroll on load
          return [...prevHistory, newMessage];
        } else {
          //do this if our messages are still loading from backend
          messageBufferRef.current.push(newMessage);
          return null;
        }
      });
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket]);

  // this adds messages from backend message history to chatHistory
  useEffect(() => {
    if (!messageHistoryData) {
      return;
    }

    const reformattedMessageHistoryData = messageHistoryData.messages.map(
      //^^^^^ RIGHT HERE OFFICER (messages.)
      (msg) => ({
        sender_id: msg.message_sender,
        message: msg.message_body,
        sent_date: msg.sent_date,
      })
    );

    // messages are stored from newest to oldest, so we reverse the order so
    // the oldest are at the lower indexes, which will be higher up on the screen
    reformattedMessageHistoryData.reverse();

    //get any messages out of the message buffer to be loaded

    const temp = [...messageBufferRef.current];
    messageBufferRef.current = [];
    savedScrollHeightRef.current =
      chatMessageContainerRef.current?.scrollHeight || 0;
    setChatHistory((prevHistory) => {
      return [
        ...reformattedMessageHistoryData,
        ...(prevHistory || []),
        ...temp,
      ];
    });
  }, [messageHistoryData]);

  useEffect(() => {
    //this scrolls to the bottom of the chat when chat is loaded on page load
    if (isFirstLoadRef.current && messageHistoryData) {
      scrollRef.current?.scrollIntoView();
      isFirstLoadRef.current = false;
    }

    //this scrolls to the bottom of the chat when a new message is sent
    else if (isNewMessageRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      isNewMessageRef.current = false;
    }

    //this scrolls to the relative last scroll position after loading older
    // messages from the backend
    else if (isLoadingOlderMessagesRef.current) {
      const chatMessageContainer = chatMessageContainerRef.current;
      const changeInScrollHeight =
        chatMessageContainer.scrollHeight - savedScrollHeightRef.current;
      chatMessageContainer.scrollTop = changeInScrollHeight;
      isLoadingOlderMessagesRef.current = false;
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
        <ChatContent
          chatMessageContainerRef={chatMessageContainerRef}
          scrollRef={scrollRef}
          messageHistoryLoading={messageHistoryLoading}
          messageHistoryError={messageHistoryError}
          loadMessageHistory={loadMessageHistory}
          chatHistory={chatHistory}
          sendToID={sendToID}
        />
        <MessageInput
          messageText={messageText}
          setMessageText={setMessageText}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default Chat;
