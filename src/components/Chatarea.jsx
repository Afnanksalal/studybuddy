"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import { Send, Trash, Paperclip } from "lucide-react";
import Image from "next/image";

const ChatArea = () => {
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      role: "model",
      parts: "Hello! I'm StudyBuddy, your AI study companion. Ask me anything, and I'll do my best to help.",
    },
  ]);
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_APIKEY);
  const [chat, setChat] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  useEffect(() => {
    if (!chat) {
      const initializeChat = async () => {
        try {
          const newChat = await model.startChat({
            generationConfig: {
              maxOutputTokens: 400,
            },
          });
          setChat(newChat);
        } catch (error) {
          console.error("Error initializing chat:", error);
          // Handle error, e.g., display an error message to the user
        }
      };
      initializeChat();
    }
  }, [chat, model]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFilePreview(reader.result);
        }
      };
      if (selectedFile.type.startsWith("image/")) {
        reader.readAsDataURL(selectedFile);
        setFileType("image");
      } else if (selectedFile.type === "application/pdf") {
        reader.readAsDataURL(selectedFile);
        setFileType("pdf");
      } else if (selectedFile.type === "text/plain") {
        reader.readAsText(selectedFile);
        setFileType("text");
      } else {
        setFilePreview(null);
        setFileType(null);
      }
    } else {
      setFilePreview(null);
      setFileType(null);
    }
  }, [selectedFile]);

  async function chatting() {
    if (!input.trim() && !selectedFile) {
      setHistory((oldHistory) => [
        ...oldHistory,
        {
          role: "model",
          parts: "Please enter a message or upload a file to continue.",
        },
      ]);
      return;
    }

    setLoading(true);
    setHistory((oldHistory) => [
      ...oldHistory,
      {
        role: "user",
        parts: input,
        file: filePreview,
        fileName: selectedFile ? selectedFile.name : undefined,
        fileType: fileType,
      },
      {
        role: "model",
        parts: "Thinking...",
      },
    ]);
    setInput("");
    setSelectedFile(null);

    try {
      let prompt = input;
      let file = null;
      if (selectedFile) {
        const base64EncodedDataPromise = new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              resolve(reader.result.split(",")[1]);
            } else {
              console.error("FileReader result is null");
            }
          };
          if (selectedFile.type.startsWith("image/")) {
            reader.readAsDataURL(selectedFile);
          } else if (selectedFile.type === "application/pdf") {
            reader.readAsDataURL(selectedFile);
          } else if (selectedFile.type === "text/plain") {
            reader.readAsText(selectedFile);
          }
        });
        const base64Data = await base64EncodedDataPromise;
        file = {
          inlineData: {
            data: base64Data,
            mimeType: selectedFile.type,
          },
        };
      }

      console.log("Prompt:", prompt);
      console.log("File:", file);

      const result = await model.generateContent([prompt, file]);
      if (result) {
        const response = await result.response;
        const text = response.text();
        setLoading(false);
        setHistory((oldHistory) => {
          const newHistory = oldHistory.slice(0, oldHistory.length - 1);
          newHistory.push({
            role: "model",
            parts: text,
          });
          return newHistory;
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error sending message:", error);
      setHistory((oldHistory) => {
        const newHistory = oldHistory.slice(0, oldHistory.length - 1);
        newHistory.push({
          role: "model",
          parts: "Oops! Something went wrong. Please try again later.",
        });
        return newHistory;
      });
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent the default behavior of inserting a new line
      chatting();
    }
  }

  function reset() {
    setHistory([
      {
        role: "model",
        parts: "Hello! I'm StudyBuddy, your AI study companion. Ask me anything, and I'll do my best to help.",
      },
    ]);
    setInput("");
    setChat(null);
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  return (
    <div className="relative flex px-2 justify-center max-w-3xl min-h-dvh w-full pt-6 max-h-screen ">
    <div className="flex text-sm md:text-base flex-col pt-10 pb-16 w-full flex-grow flex-1 overflow-y-auto">
    {Array.isArray(history) && history.length > 0 && (
      history.map((item, index) => (
        <div
        key={index}
        className={`chat ${
          item.role === "model" ? "chat-start" : "chat-end"
        }`}
        >
        {item.file && (
          <div className="relative mb-2">
          {item.fileType === "image" && (
            <img
            src={item.file}
            alt="Uploaded Image Preview"
            className="w-full h-auto rounded-md overflow-hidden"
            />
          )}
          {item.fileType === "pdf" && (
            <embed
            src={item.file}
            type="application/pdf"
            className="w-full h-auto rounded-md"
            />
          )}
          {item.fileType === "text" && (
            <div className="w-full h-auto rounded-md bg-gray-800 p-2 overflow-auto">
            <pre className="text-xs font-light opacity-70">
            {item.file}
            </pre>
            </div>
          )}
          {item.fileName && (
            <p className="text-xs font-light opacity-70 mt-1">
            {item.fileName}
            </p>
          )}
          </div>
        )}
        <div className="chat-bubble font-medium p-3 bg-gray-800 rounded-lg shadow-md overflow-x-auto">
        <Markdown components={{
          p: ({ node, ...props }) => (
            <p {...props} style={{ whiteSpace: 'pre-wrap' }}>
            {props.children}
            </p>
          ),
          pre: ({ node, ...props }) => (
            <pre {...props} style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
            {props.children}
            </pre>
          ),
          code: ({ node, ...props }) => (
            <code {...props} style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
            {props.children}
            </code>
          ),
        }}>{item.parts}</Markdown>
        </div>
        </div>
      ))
    )}
    <div ref={messagesEndRef} />
    </div>
    <div className="absolute px-2 bottom-2 w-full flex flex-col gap-1">
    {filePreview && (
      <div className="mb-2">
      {fileType === "image" && (
        <img
        src={filePreview}
        alt="Uploaded Image Preview"
        className="w-32 h-32 rounded-md overflow-hidden"
        />
      )}
      {fileType === "pdf" && (
        <embed
        src={filePreview}
        type="application/pdf"
        className="w-32 h-32 rounded-md"
        />
      )}
      {fileType === "text" && (
        <div className="w-32 h-32 rounded-md bg-gray-800 p-2 overflow-auto">
        <pre className="text-xs font-light opacity-70">
        {filePreview}
        </pre>
        </div>
      )}
      </div>
    )}
    <div className="flex gap-1">
    <input
    type="file"
    accept="image/*,application/pdf,text/plain"
    className="file-input w-full file-input-primary hidden"
    onChange={handleFileChange}
    placeholder="file"
    title="file"
    id="file-input"
    />
    <label
    htmlFor="file-input"
    className="btn btn-accent rounded-3xl shadow-md btn-outline backdrop-blur"
    >
    <Paperclip />
    </label>
    <textarea
    type="text"
    value={input}
    required
    rows={1}
    onKeyDown={handleKeyDown}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Ask a Question..."
    className="textarea backdrop-blur textarea-primary w-full mx-auto bg-opacity-60 font-medium shadow rounded-3xl"
    />
    <button
    className={`btn rounded-3xl shadow-md ${
      loading
      ? "btn-accent cursor-wait pointer-events-none"
      : "btn-primary"
    }`}
    title="send"
    onClick={chatting}
    >
    {loading ? (
      <span className="loading loading-spinner loading-sm"></span>
    ) : (
      <span className="inline-block"><Send /></span>
    )}
    </button>
    <button
    className="btn btn-outline shadow-md btn-error rounded-3xl backdrop-blur"
    title="send"
    onClick={reset}
    >
    <Trash />
    </button>
    </div>
    </div>
    </div>
  );
};

export default ChatArea;
