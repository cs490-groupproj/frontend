import {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import useGetFromAPI from "@/hooks/useGetFromAPI";

export const useChatRoom = (socket, user) => {
  const messageLoadLimit = 50;
  const startOffset = 0;

  const [chatHistory, setChatHistory] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [selectedChatUserID, setSelectedChatUserID] = useState(null);
  const [messageHistoryURI, setMessageHistoryURI] = useState(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);

  const scrollRef = useRef(null);
  const chatMessageContainerRef = useRef(null);

  const isNewMessageRef = useRef(false);
  const isFirstLoadRef = useRef(true);
  const isLoadingOlderMessagesRef = useRef(false);
  const messageBufferRef = useRef([]); //stores messages that are received on page load
  const savedScrollHeightRef = useRef(null);

  const {
    data: userCoachesData,
    loading: userCoachesLoading,
    error: userCoachesError,
  } = useGetFromAPI(`/clients/${user.user_id}/coaches`, null);

  const {
    data: messageHistoryData,
    loading: messageHistoryLoading,
    error: messageHistoryError,
  } = useGetFromAPI(messageHistoryURI, null);

  const handleNewMessage = useCallback((newMessage) => {
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
  }, []);

  //handles clearing the chat history when the conversation is changed to avoid flicker
  const handleSwitchConversation = useCallback((changedUserID) => {
    setSelectedChatUserID(changedUserID);
    setChatHistory(null);
  }, []);

  //handles changing the conversation
  useEffect(() => {
    if (!selectedChatUserID) {
      //if not in a conversation, don't be in a conversation
      setMessageHistoryURI(null);
      setChatHistory(null);
      return;
    }

    if (!socket) {
      setMessageHistoryURI(null);
      setChatHistory(null);
      console.log("no socket somehow");
      return;
    }

    isFirstLoadRef.current = true;
    messageBufferRef.current = [];
    setChatHistory(null);
    setHasMoreHistory(true);

    //this joins the room and listens for incoming messages
    socket.emit("join", { other_id: selectedChatUserID });

    socket.on("new_message", handleNewMessage);

    setMessageHistoryURI(
      `/messages/history?limit=${messageLoadLimit}&offset=${startOffset}&other_party_user_id=${selectedChatUserID}`
    );

    return () => {
      socket.emit("leave", { other_id: selectedChatUserID });
      socket.off("new_message", handleNewMessage);
    };
  }, [selectedChatUserID, socket, handleNewMessage]);

  //ensures that a message has content and is not just whitespace
  const handleSendMessage = useCallback(() => {
    if (!socket) {
      return;
    }
    if (messageText.trim() === "") {
      return;
    }
    socket.emit("send_message", {
      message: messageText,
    });
    setMessageText("");
  }, [socket, messageText]);

  //loads more messages when the user triggers it
  const loadMessageHistory = useCallback(() => {
    if (messageHistoryLoading) {
      return;
    }

    isLoadingOlderMessagesRef.current = true;

    const currOffset = (chatHistory || []).length;
    setMessageHistoryURI(
      `/messages/history?limit=${messageLoadLimit}&offset=${currOffset}&other_party_user_id=${selectedChatUserID}`
    );
  }, [messageHistoryLoading, chatHistory, selectedChatUserID]);

  // this adds messages from backend message history to chatHistory
  useEffect(() => {
    if (!messageHistoryData) {
      return;
    }

    const reformattedMessageHistoryData = messageHistoryData.messages.map(
      (msg) => ({
        sender_id: msg.message_sender,
        message: msg.message_body,
        sent_date: msg.sent_date,
      })
    );

    // messages are stored from newest to oldest, so we reverse the order so
    // the oldest are at the lower indexes, which will be higher up on the screen
    reformattedMessageHistoryData.reverse();

    if (reformattedMessageHistoryData.length < messageLoadLimit) {
      setHasMoreHistory(false);
    }

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

  useLayoutEffect(() => {
    //this scrolls to the bottom of the chat when chat is loaded on page load
    if (isFirstLoadRef.current && chatHistory !== null) {
      scrollRef.current?.scrollIntoView();
      isFirstLoadRef.current = false;
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

  useEffect(() => {
    //this scrolls to the bottom of the chat when a new message is sent
    if (isNewMessageRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      isNewMessageRef.current = false;
    }
  }, [chatHistory]);

  return {
    chat_sidebar: {
      userCoachesError,
      userCoachesLoading,
      userCoachesData,
      handleSwitchConversation,
      selectedChatUserID,
    },
    chat_content: {
      chatMessageContainerRef,
      scrollRef,
      messageHistoryLoading,
      messageHistoryError,
      loadMessageHistory,
      chatHistory,
      selectedChatUserID,
      hasMoreHistory,
    },
    message_input: { messageText, setMessageText, handleSendMessage },
  };
};
