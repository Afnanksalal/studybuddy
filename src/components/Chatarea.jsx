"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import { Send, Trash, Paperclip } from "lucide-react";


const ChatArea = () => {
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([
    {
      role: "system", // This will not be displayed but is important for context
      parts: "You are StudyBuddy, an AI study companion. Respond in a helpful, respectful, and educational manner.  Focus on study-related topics. If a query is not directly related to studying, try to gently steer the conversation back to educational topics.",
    },
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
        setFilePreview(reader.result);
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
        setFilePreview(null); // Or handle unsupported file types appropriately
        setFileType(null);
      }
    } else {
      setFilePreview(null);
      setFileType(null);
    }
  }, [selectedFile]);


  const discouragedKeywords = ["cheat", "hack", "illegal", "plagiarize"];

  async function chatting() {
    const trimmedInput = input.trim();

    if (!trimmedInput && !selectedFile) {
      // Handle empty input
      return;
    }

    const containsDiscouraged = discouragedKeywords.some((word) =>
    trimmedInput.toLowerCase().includes(word)
    );

    if (containsDiscouraged) {
      setHistory((oldHistory) => [
        ...oldHistory,
        {
          role: "user",
          parts: trimmedInput,
          file: filePreview,
          fileName: selectedFile?.name,
          fileType,
        },
        {
          role: "model",
          parts: "I'm here to help you study.  Let's keep our conversation focused on educational topics.",
        },
      ]);
      setInput("");
      setSelectedFile(null);
      setFilePreview(null);
      setFileType(null);

      return;
    }


    setLoading(true);
    setHistory((oldHistory) => [
      ...oldHistory,
      {
        role: "user",
        parts: trimmedInput,
        file: filePreview,
        fileName: selectedFile?.name,
        fileType,
      },
      { role: "model", parts: "Thinking..." },
    ]);
    setInput("");
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);


    try {
      let prompt = trimmedInput;
      let file = null;

      if (selectedFile) {
        const base64EncodedDataPromise = new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              if (selectedFile.type.startsWith("image/") || selectedFile.type === "application/pdf") {
                resolve(reader.result.split(",")[1]);
              } else if (selectedFile.type === "text/plain") {
                resolve(reader.result);
              }
            } else {
              console.error("FileReader result is null");
              resolve(null);
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
        if (base64Data) {
          file = {
            inlineData: {
              data: base64Data,
              mimeType: selectedFile.type,
            },
          };
        }
      }


      const systemPrompt =
      "Please answer this in a helpful, respectful, and educational manner, focusing only on study-related content.";

          const combinedPrompt = `${systemPrompt}\n\n${prompt}`;

          const result = await model.generateContent([combinedPrompt, file].filter(Boolean));


          if (result) {
            const response = await result.response;
            const text = await response.text();

            setLoading(false);
            setHistory((oldHistory) => {
              const newHistory = oldHistory.slice(0, oldHistory.length - 1);
              newHistory.push({ role: "model", parts: text });
              return newHistory;
            });
          }
          else {
            throw new Error("No response from AI model.");
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
      e.preventDefault();
      chatting();
    }
  }

  function reset() {
    setHistory([
      {
        role: "system",
        parts: "You are StudyBuddy, an AI study companion. Respond in a helpful, respectful, and educational manner. Focus solely on study-related topics and avoid inappropriate or non-educational content.",
      },
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
    <div className="relative flex px-2 justify-center max-w-3xl min-h-dvh w-full pt-6 max-h-screen">
    <div className="flex text-sm md:text-base flex-col pt-1 pb-16 w-full flex-grow flex-1 overflow-y-auto mt-9">
    {history
      .filter((item) => item.role !== "system") // Filter out system messages
      .map((item, index) => (
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
        <div
        className={`chat-bubble font-medium p-3 rounded-lg shadow-md overflow-x-auto ${
          item.role === "model"
          ? "bg-blue-100 text-gray-800"
          : "bg-green-100 text-gray-800"
        }`}
        >
        <Markdown
        components={{
          p: ({ node, ...props }) => (
            <p {...props} style={{ whiteSpace: "pre-wrap" }}>
            {props.children}
            </p>
          ),
          pre: ({ node, ...props }) => (
            <pre
            {...props}
            style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}
            >
            {props.children}
            </pre>
          ),
          code: ({ node, ...props }) => (
            <code
            {...props}
            style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}
            >
            {props.children}
            </code>
          ),
        }}
        >
        {item.parts}
        </Markdown>
        </div>
        </div>
      ))
    }
    <div ref={messagesEndRef} /> {/* Keep this outside the map */}
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
    className="btn btn-accent rounded-2xl shadow-md backdrop-blur"
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
    placeholder="Chat"
    className="textarea backdrop-blur textarea-primary w-full mx-auto bg-opacity-60 font-medium shadow rounded-2xl no-resize border-2"
    style={{ outline: "none" }}
    />
    <button
    className={`btn rounded-2xl shadow-md ${
      loading ? "btn-accent cursor-wait pointer-events-none" : "btn-primary"
    }`}
    title="send"
    onClick={chatting}
    >
    {loading ? (
      <span className="loading loading-spinner loading-sm"></span>
    ) : (
      <span className="inline-block">
      <Send />
      </span>
    )}
    </button>
    <button
    className="btn shadow-md btn-error rounded-2xl backdrop-blur"
    title="reset"
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
