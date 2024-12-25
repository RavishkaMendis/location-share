import React, { useState, useRef, useEffect } from 'react';

const Chat = ({ selectedUser, ws, username, sessionId, messages }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      type: 'chat_message',
      sessionId: sessionId,
      to: selectedUser.username,
      from: username,
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(messageData));
      setNewMessage('');
    }
  };

  // Filter messages for current chat
  const chatMessages = messages.filter(msg => 
    (msg.from === username && msg.to === selectedUser.username) ||
    (msg.from === selectedUser.username && msg.to === username)
  );

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span className="chat-title">
          Chat with {selectedUser.username}
        </span>
        <span className={`user-status ${selectedUser.online ? 'online' : 'offline'}`}>
          {selectedUser.online ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="messages-container">
        {chatMessages.map((msg, index) => (
          <div 
            key={`${msg.timestamp}-${index}`}
            className={`message ${msg.from === username ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              {msg.text}
            </div>
            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat; 