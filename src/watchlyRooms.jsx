import React, { useState } from "react";
import "./WatchlyRooms.css";

const WatchlyRooms = () => {
  const [roomName, setRoomName] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [roomID, setRoomID] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  const handleCreateRoom = () => {
    alert(`Room Created: ${roomName} - Video: ${videoURL}`);
  };

  const handleJoinRoom = () => {
    alert(`Joining Room: ${roomID}`);
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1 className="logo">
          <span className="highlight">W</span>atchly
        </h1>
        <nav>
          <ul>
            <li className="nav-item">Home</li>
            <li className="nav-item active">Rooms</li>
            <li className="nav-item">Settings</li>
            <li className="nav-item">Chat</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="forms-container">
          {/* Create Room */}
          <div className="form-box">
            <h2>Create Room</h2>
            <input
              className="input-field"
              type="text"
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <input
              className="input-field"
              type="text"
              placeholder="Video URL"
              value={videoURL}
              onChange={(e) => setVideoURL(e.target.value)}
            />
            <input
              className="input-field"
              type="password"
              placeholder="Password (optional)"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
            />
            <button className="btn" onClick={handleCreateRoom}>Create Room</button>
          </div>

          {/* Join Room */}
          <div className="form-box">
            <h2>Join Room</h2>
            <input
              className="input-field"
              type="text"
              placeholder="Room ID"
              value={roomID}
              onChange={(e) => setRoomID(e.target.value)}
            />
            <input
              className="input-field"
              type="password"
              placeholder="Password (optional)"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
            />
            <button className="btn" onClick={handleJoinRoom}>Join Room</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WatchlyRooms;
