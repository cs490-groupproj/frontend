import React from "react";

const ChatContent = ({
  chatMessageContainerRef,
  scrollRef,
  messageHistoryLoading,
  messageHistoryError,
  loadMessageHistory,
  chatHistory,
  selectedChatUserID,
  hasMoreHistory,
}) => {
  return (
    <div
      ref={chatMessageContainerRef}
      className="bg-card no-scrollbar relative flex flex-1 flex-col gap-1
        overflow-x-hidden overflow-y-auto rounded-xl p-4"
      id="Chat Messages"
      onScroll={(e) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop <= 0 && !messageHistoryLoading && hasMoreHistory) {
          loadMessageHistory();
        }
      }}
    >
      <div className="flex flex-1 items-center justify-center">
        {messageHistoryError ? (
          <p>error: {messageHistoryError}</p>
        ) : !chatHistory ? (
          !selectedChatUserID ? (
            <p>Select a Chat</p>
          ) : (
            <p>Loading Messages</p>
          )
        ) : (
          <></>
        )}
      </div>
      {!messageHistoryError && chatHistory && (
        <>
          {hasMoreHistory && (
            <div className="flex h-14 w-full justify-center">
              {
                <div
                  className="border-primary h-6 w-6 animate-spin rounded-full
                    border-2 border-t-transparent"
                />
              }
            </div>
          )}

          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`w-fit max-w-[75%] rounded-3xl px-4 py-2 break-words
              whitespace-pre-wrap ${
                msg.sender_id === selectedChatUserID
                  ? `bg-secondary text-secondary-foreground mr-auto
                    rounded-bl-sm`
                  : "bg-primary text-primary-foreground ml-auto rounded-br-sm"
              }`}
            >
              {msg.message}
            </div>
          ))}
        </>
      )}
      <div ref={scrollRef}></div>
    </div>
  );
};

export default React.memo(ChatContent);
