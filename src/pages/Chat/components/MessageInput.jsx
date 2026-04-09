import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "@/components/icons/lucide-send";

const MessageInput = ({ messageText, setMessageText, handleSendMessage }) => {
  return (
    <div id="Message Input" className="relative">
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
  );
};

export default MessageInput;
