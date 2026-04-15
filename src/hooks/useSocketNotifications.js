import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "/config.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import usePostToAPI from "@/hooks/usePostToAPI";

export const useSocketNotifications = () => {
  const [socket, setSocket] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [userRequestURI, setUserRequestURI] = useState(null);
  const [chatNotificationsRequestURI, setChatNotificationsRequestURI] =
    useState(null);

  const [unreadChatNotifications, setUnreadChatNotifications] = useState({});
  const { postFunction } = usePostToAPI();

  //gets the userID, requestURI will be null until the auth token is gotten
  const { data: user } = useGetFromAPI(userRequestURI, null);
  const { data: storedUnreadChatNotifications } = useGetFromAPI(
    chatNotificationsRequestURI,
    null
  );

  const handleMarkMessagesAsRead = useCallback(async (other_party_user_id) => {
    setUnreadChatNotifications((prev) => {
      const { [other_party_user_id]: _, ...rest } = prev;
      return rest;
    });
    try {
      await postFunction("/messages/mark_received", {
        other_party_user_id: other_party_user_id,
      });
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  });

  //handles notifications from backend on load
  useEffect(() => {
    if (storedUnreadChatNotifications?.unread_message_counts) {
      setUnreadChatNotifications((prev) => {
        return storedUnreadChatNotifications.unread_message_counts.reduce(
          (accumulator, item) => {
            accumulator[item.message_sender_id] = {
              count:
                item.unread_count + (prev[item.message_sender_id]?.count || 0),
            };
            return accumulator;
          },
          { ...prev }
        );
      });
    }
  }, [storedUnreadChatNotifications]);

  //socket notification handler
  const handleNewNotification = useCallback((data) => {
    const notification_type = data.notification_type;
    if (notification_type === "chat_message") {
      const sender_id = data.sender_id;
      setUnreadChatNotifications((prev) => ({
        ...prev,
        [sender_id]: {
          count: prev[sender_id]?.count ? prev[sender_id].count + 1 : 1,
        },
      }));
    }
  }, []);

  //Paused until auth loads to prevent 401 errors
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setAuthToken(token);
        //since we have auth, we can change the requestURI to the one to fetch the user id
        setUserRequestURI("/users/me");
        setChatNotificationsRequestURI("/messages/unread_message_count");
      }
    });
    return () => unsubscribe();
  }, []);

  //when we get the authToken, get sockets
  useEffect(() => {
    if (!authToken) {
      return;
    }
    const newSocket = io(API_BASE_URL, {
      query: { token: authToken },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [authToken]);

  useEffect(() => {
    if (!socket) {
      console.log("no socket somehow, cannot set up notifications");
      return;
    }

    //turns on notification listener (joined automatically on connect in the backend)
    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket, handleNewNotification]);

  return {
    authToken,
    socket,
    user,
    unreadChatNotifications,
    handleMarkMessagesAsRead,
  };
};
