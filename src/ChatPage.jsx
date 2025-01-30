import React, { useState } from "react";
import { Search, Bell, Moon, Menu, Send } from "lucide-react";
import "./ChatPage.css";

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [activeNav, setActiveNav] = useState("Chat");
  const [activeChat, setActiveChat] = useState("Office chat");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1 className="logo">
          W<span className="highlight">▶</span>tchly
        </h1>
        <nav>
          <ul className="nav-list">
            {["Home", "Rooms", "Settings", "Chat"].map((item) => (
              <li
                key={item}
                className={`nav-item ${activeNav === item ? "active" : ""}`}
                onClick={() => setActiveNav(item)}
              >
                {item === "Home" && "🏠 "} 
                {item === "Rooms" && "📁 "} 
                {item === "Settings" && "⚙️ "} 
                {item === "Chat" && "💬 "} 
                {item}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <Menu className="menu-icon" />
            <div className="search-container">
              <Search className="search-icon" />
              <input type="text" placeholder="Search..." className="search-input" />
            </div>
          </div>
          <div className="header-right">
            <Moon className="header-icon" />
            <Bell className="header-icon" />
            <div className="user-avatar"></div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="chat-area">
          {/* Chat List */}
          <div className="chat-list">
            {["Office chat", "Friends", "Work"].map((chat) => (
              <div
                key={chat}
                className={`chat-item ${activeChat === chat ? "active" : ""}`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="chat-avatar"></div>
                <div className="chat-info">
                  <h3>{chat}</h3>
                  <p>{chat === "Office chat" ? "45 members, 25 online" : "10 members online"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Messages */}
          <div className="messages-section">
            <div className="messages-container">
              {[
                { name: "Frank Garcia", time: "08:57", text: "We will start celebrating Greg's birthday soon" },
                { name: "Jenny Li", time: "09:01", text: "We're already starting, hurry up if you're late" },
                { name: "Liz Wilson", time: "09:05", text: "I'm stuck in traffic, I'll be there a little late" },
              ].map((msg, index) => (
                <div key={index} className="message">
                  <div className="message-header">
                    <span className="sender-name">{msg.name}</span>
                    <span className="message-time">{msg.time}</span>
                  </div>
                  <p className="message-text">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="message-input-container">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
              />
              <button type="submit" className="send-button">
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
