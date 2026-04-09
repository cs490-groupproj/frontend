import React from "react";

const ChatContent = ({
  chatMessageContainerRef,
  scrollRef,
  messageHistoryLoading,
  messageHistoryError,
  loadMessageHistory,
  chatHistory,
  sendToID,
}) => {
  return (
    <div
      ref={chatMessageContainerRef}
      className="bg-card no-scrollbar flex flex-1 flex-col gap-1
        overflow-x-hidden overflow-y-auto rounded-xl p-4"
      id="Chat Messages"
      onScroll={(e) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && !messageHistoryLoading) {
          loadMessageHistory();
        }
      }}
    >
      {messageHistoryError ? (
        <p>error: {messageHistoryError}</p>
      ) : messageHistoryLoading || !chatHistory ? ( //this waits until messages are first loaded from the database to display anything
        <p>Loading Messages</p>
      ) : (
        chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`w-fit max-w-[75%] rounded-3xl px-4 py-2 break-words
              whitespace-pre-wrap ${
                msg.sender_id == sendToID
                  ? `bg-secondary text-secondary-foreground mr-auto
                    rounded-bl-sm`
                  : "bg-primary text-primary-foreground ml-auto rounded-br-sm"
              }`}
          >
            {msg.message}
          </div>
        ))
      )}
      <div ref={scrollRef}></div>
    </div>
  );
};

export default ChatContent;
