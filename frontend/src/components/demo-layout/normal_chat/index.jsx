import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { SERVER_URL } from "../../../utils/config";
import { TEToast } from "tw-elements-react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

const NormalChat = () => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filenames, setFilenames] = useState("Choose Files");
  const [files, setFiles] = useState([]);
  const [menuState, setMenuState] = useState(true);
  const [now, setNow] = useState(0);
  const [thumb, setThumb] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [modifiedAnswer, setModifiedAnswer] = useState("");
  const [open, setOpen] = useState(false);
  const [chatType, setChatType] = useState("");

  const ref = useRef();
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am Helio RCM assistant bot. How can I help you?",
      sender: "ChatGPT",
    },
  ]);

  const onUpload = () => {
    if (chatType === "") return;
    setUploading(true);
    setNow(1);
    let formData = new FormData();
    // formData.append('file', files);
    for (let i = 0; i < files.length; i++) {
      formData.append(`file-${i}`, files[i]);
    }
    formData.append("length", files.length);
    formData.append("chat", chatType);
    axios
      .post(`${SERVER_URL}/v2/normalchat_upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (data) => {
          let percent = Math.round((100 * data.loaded) / data.total);
          if (percent == 100) setNow(99);
          else setNow(percent);
          console.log(
            "Progress: ",
            Math.round((100 * data.loaded) / data.total)
          );
        },
      })
      .then((res) => {
        console.log(res);
        if (res.data === "success") {
          setUploading(false);
          setOpen(true);
        }
      });
  };

  const onFileSelect = (event) => {
    if (chatType === "") return;
    console.log("function", "onFileSelect");
    console.log(event.target.files);
    setFiles(event.target.files);
    let names = "";
    Array.from(event.target.files).forEach((file, index) => {
      if (index) names += ", ";
      names += file.name;
    });
    setFilenames(names);
  };

  const modifyAnswer = () => {
    axios
      .post(`${SERVER_URL}/v2/chat_modify`, {
        chat: chatType,
        query: lastMessage,
        answer: modifiedAnswer,
      })
      .then((res) => {
        setModifiedAnswer("");
        setThumb(false);
      });
  };

  const processMessageToChatGPT = (message) => {
    setIsLoading(true);
    setThumb(false);
    axios
      .post(`${SERVER_URL}/v2/normalchat_query`, {
        query: message,
        chat: chatType,
      })
      .then((res) => {
        setIsLoading(false);
        if (res.data != null) {
          console.log(res.data);
          setMessages([
            ...messages,
            {
              message: question,
              sender: "user",
            },
            {
              message: res.data.answer,
              sender: "ChatGPT",
              filename: res.data.filename,
              page: res.data.page,
            },
          ]);
        }
      });
  };

  const OnShowPDF = (index) => {
    console.log(messages[index]);
    if (messages[index].sender !== "ChatGPT") return;
    window.open(
      `${SERVER_URL}/v2/uploads/${messages[index].filename}#page=${messages[index].page}`,
      "_blank"
    );
  };

  const handleSend = () => {
    if (chatType === "") return;
    if (isLoading) return;
    if (!question.trim()) {
      return; // Ignore empty messages
    }
    scrollToBottom();
    setMessages([
      ...messages,
      {
        message: question,
        sender: "user",
      },
    ]);
    processMessageToChatGPT(question);
    setQuestion("");
  };
  const scrollToBottom = () => {
    try {
      ref.current.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      console.log("sw");
    }
  };

  const OnThumbDown = () => {
    setThumb(true);
    let i = messages.length - 1;
    for (; i >= 0; i--) {
      if (messages[i].sender === "ChatGPT") {
        i--;
        setLastMessage(messages[i].message);
        console.log(messages[i].message);
        break;
      }
    }
  };

  const clearMessage = () => {
    setMessages([
      {
        message: "Hello, I am Helio RCM assistant bot. How can I help you?",
        sender: "ChatGPT",
      },
    ]);
  };

  useEffect(() => {
    scrollToBottom();
    console.log(messages);
  }, [messages]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-center">
        <TEToast open={open} autohide={true} delay={3000} setOpen={setOpen}>
          <div className="flex items-center justify-between rounded-t-lg border-b-2 border-neutral-100 border-opacity-100 bg-blue-600 px-4 pb-2 pt-2.5">
            <p className="font-bold text-white">Helio RCM Alert</p>
            <div className="flex items-center">
              <p className="text-xs text-white">Just now</p>
              <button
                type="button"
                className="ml-2 box-content rounded-none border-none opacity-80 text-white"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <span className="w-[1em] focus:opacity-100 disabled:pointer-events-none disabled:select-none disabled:opacity-25 [&.disabled]:pointer-events-none [&.disabled]:select-none [&.disabled]:opacity-25">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
          <div className="break-words rounded-b-lg px-4 py-4 text-neutral-700 dark:text-neutral-200">
            Training completed!
          </div>
        </TEToast>
      </div>
      <div className="flex justify-between items-center gap-[30%]">
        <p className="font-poppins text-[32px] text-[rgb(4,52,217)] font-semibold text-center">
          ChatBot
        </p>
        {menuState && (
          <div className="mb-3 w-96 flex items-center gap-4 flex-1">
            <div
              className={`w-full bg-neutral-200 dark:bg-neutral-600 ${uploading ? "visible" : "invisible"
                }`}
            >
              <div
                className="bg-blue-800 p-0.5 text-center text-xs font-medium leading-none text-white"
                style={{ width: `${now}%` }}
              >
                {now === 99 ? "Training..." : `${now}%`}
              </div>
            </div>
            <input
              className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
              type="file"
              accept=".pdf"
              multiple
              onChange={onFileSelect}
              id="formFile"
            />
            <button
              className="bg-blue-800 text-white px-6 py-2 rounded-xl"
              onClick={onUpload}
            >
              Upload
            </button>
          </div>
        )}
      </div>
      <SimpleBar className="max-h-[600px] flex-1">
        <div className="flex flex-col flex-1 gap-2">
          {messages.map((row, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 ${row.sender === "ChatGPT" ? "justify-start" : "justify-end"
                }`}
            >
              {row.sender === "ChatGPT" && (
                <div className="cursor-pointer">
                  <img src="/favicon.png" alt="Helio RCM" className="w-8" />
                </div>
              )}
              <div
                data-tooltip-target={`tooltip-${index}`}
                className={`cursor-pointer block rounded-lg p-6 max-w-[30%] font-poppins font-semibold ${row.sender === "ChatGPT"
                  ? "bg-blue-800 text-white"
                  : "bg-yellow-700 text-white"
                  }`}
                onClick={() => OnShowPDF(index)}
              >
                <p className="text-base">{row.message}</p>
              </div>
              {row.filename !== undefined && (
                <div
                  id={`tooltip-${index}`}
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
                >
                  <div>
                    File: {row.filename}
                    <br />
                    Page: {row.page}
                  </div>
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
              )}
              {row.sender === "ChatGPT" && index !== 0 && (
                <div className="cursor-pointer" onClick={() => setThumb(false)}>
                  <img src="/up.png" alt="Helio RCM" className="w-8" />
                </div>
              )}
              {row.sender === "ChatGPT" && index !== 0 && (
                <div className="cursor-pointer" onClick={() => setThumb(true)}>
                  <img src="/down.png" alt="Helio RCM" className="w-8" />
                </div>
              )}
              {row.sender === "user" && index !== 0 && (
                <div className="cursor-pointer">
                  <img src="/user.png" alt="Helio RCM" className="w-8" />
                </div>
              )}
            </div>
          ))}
        </div>
      </SimpleBar>
      {thumb && (
        <div className="flex items-center gap-4">
          <textarea
            className="border rounded-lg border-blue-800 p-4 focus:border-blue-800 min-h-[50px] min-w-[30%]"
            value={modifiedAnswer}
            onChange={(e) => setModifiedAnswer(e.target.value)}
          ></textarea>
          <button
            className="bg-blue-800 text-white px-6 py-2 rounded-xl"
            onClick={modifyAnswer}
          >
            Save
          </button>
        </div>
      )}
      {isLoading && (
        <div className="flex items-center">
          <img src="/pen.gif" alt="pen" className="h-16" />
          <span>Helio RCM Bot is typing....</span>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {chatType === "" && (
          <div className="flex flex-col items-center transition-transform">
            <div className="grid grid-cols-1 gap-3 justify-center items-center min-w-[400px] md:grid-cols-2">
              <div
                className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-2xl cursor-pointer"
                onClick={() => setChatType("UHC")}
              >
                UHC
              </div>
              <div className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-2xl cursor-pointer"
                onClick={() => setChatType("Medicare")}>
                Medicare
              </div>
              <div
                className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-2xl cursor-pointer"
                onClick={() => setChatType("General")}
              >
                General
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-center gap-7 items-center">
          <input
            type="text"
            className="border rounded-lg border-blue-800 min-w-[50%] p-4 focus:border-blue-800"
            autoFocus={true}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.keyCode == 13) {
                handleSend();
              }
            }}
          />
          <button
            className="bg-blue-800 text-white px-6 py-2 rounded-xl"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
export default NormalChat;
