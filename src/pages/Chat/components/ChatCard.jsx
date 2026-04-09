import React from "react";

const ChatCard = ({ coach, setSelectedChatUserID, selectedChatUserID }) => {
  return (
    <div
      onClick={() => {
        setSelectedChatUserID(coach.id);
      }}
      className={`hover:bg-accent hover:ring-ring border-border flex w-full
        flex-col items-center rounded-lg border-1 p-2 hover:ring-1
        hover:ring-inset
        ${coach.id === selectedChatUserID ? "bg-secondary" : "bg-transparent"}`}
    >
      <div>
        {coach.first_name} {coach.last_name}
      </div>
      <div>{/*profile picture here eventually???*/}</div>
    </div>
  );
};

export default ChatCard;
