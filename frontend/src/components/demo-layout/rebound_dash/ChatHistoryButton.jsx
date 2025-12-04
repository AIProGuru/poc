import React from "react";

const ChatHistoryButton = (props) => {
  return (
    <span
      className="font-normal text-[16px] p-4 bg-white rounded-2xl cursor-pointer"
      onClick={props.onClick}
    >
      {props.children}
    </span>
  );
};

export default ChatHistoryButton;
