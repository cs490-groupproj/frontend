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
  const { postFunction } = usePostToAPI();

  const [notifications, setNotifications] = useState({
    chat: {},
    requests: [],
    workouts: [],
    system: [],
  }); // All notifications must include a `type` matching NOTIFICATION_CONFIG

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  //gets the userID, requestURI will be null until the auth token is gotten
  const { data: user, error: userError } = useGetFromAPI(userRequestURI, null);
  const { data: storedUnreadChatNotifications } = useGetFromAPI(
    chatNotificationsRequestURI,
    null
  );

  //removes read messages from notifications and marks as read in backend
  const handleMarkMessagesAsRead = useCallback(
    async (other_party_user_id) => {
      setNotifications((prev) => {
        const chatNotifications = { ...prev.chat };
        delete chatNotifications[other_party_user_id];
        return { ...prev, chat: chatNotifications };
      });
      try {
        await postFunction("/messages/mark_received", {
          other_party_user_id: other_party_user_id,
        });
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    },
    [postFunction]
  );

  //handles chat notifications from backend on load
  useEffect(() => {
    if (storedUnreadChatNotifications?.unread_message_counts) {
      setNotifications((prev) => {
        const initialChatNotifications =
          storedUnreadChatNotifications.unread_message_counts.reduce(
            (accumulator, item) => {
              accumulator[item.message_sender_id] = {
                type: "chat_message",
                name: item.message_sender_name,
                count:
                  item.unread_count +
                  (prev.chat[item.message_sender_id]?.count || 0),
              };
              return accumulator;
            },
            { ...prev.chat }
          );
        return { ...prev, chat: initialChatNotifications };
      });
    }
  }, [storedUnreadChatNotifications]);

  //socket notification handler
  const handleNewNotification = useCallback((data) => {
    const notification_type = data.notification_type;
    setNotifications((prev) => {
      if (notification_type === "chat_message") {
        const sender_id = data.sender_id;
        return {
          ...prev,
          chat: {
            ...prev.chat,
            [sender_id]: {
              type: notification_type,
              name: data.sender_name,
              count: prev.chat[sender_id]?.count
                ? prev.chat[sender_id].count + 1
                : 1,
            },
          },
        };
      }

      //handle other live socket notifications here
      return prev;
    });
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
      setIsAuthLoading(false);
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
      return;
    }

    //turns on notification listener (joined automatically on connect in the backend)
    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket, handleNewNotification]);

  const isAppLoading =
    isAuthLoading || (userRequestURI !== null && !user && !userError);

  return {
    authToken,
    socket,
    user,
    notifications,
    handleMarkMessagesAsRead,
    isAppLoading,
  };
};
