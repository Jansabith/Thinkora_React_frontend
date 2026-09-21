import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, ChevronLeft, Smile } from 'lucide-react'
import Picker from 'emoji-picker-react'
import Avatar from './Avatar'
import { apiRequest } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import './FloatingChat.css'

function FloatingChat() {
  const { user: currentUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [activeChatUser, setActiveChatUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [readMsgIds, setReadMsgIds] = useState(new Set())
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const messagesEndRef = useRef(null)

  // Mark messages as read when viewing a user's chat
  useEffect(() => {
    if (activeChatUser) {
      setReadMsgIds(prev => {
        const newSet = new Set(prev)
        let changed = false
        messages.forEach(m => {
          if (m.from_id === activeChatUser.id && !newSet.has(m.id)) {
            newSet.add(m.id)
            changed = true
          }
        })
        return changed ? newSet : prev
      })
    }
  }, [messages, activeChatUser])

  // Poll for online users and messages
  useEffect(() => {
    if (!currentUser) return

    const fetchChatData = async () => {
      try {
        const syncRes = await apiRequest('/chat/sync/')
        setOnlineUsers(syncRes.online_users || [])
        setMessages(syncRes.messages || [])
      } catch (err) {
        console.error('Chat polling error:', err)
      }
    }

    fetchChatData() // initial fetch
    const interval = setInterval(fetchChatData, 4000) // poll every 4 seconds

    return () => clearInterval(interval)
  }, [currentUser])

  // Scroll to bottom when messages change in active chat
  useEffect(() => {
    if (activeChatUser && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeChatUser])

  const handleOpenChat = () => {
    setIsOpen(true)
  }

  const handleCloseChat = () => {
    setIsOpen(false)
    setActiveChatUser(null)
    setShowEmojiPicker(false)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || !activeChatUser) return

    const textToSend = inputText.trim()
    setInputText('')
    setShowEmojiPicker(false)

    try {
      const tempMsg = {
        id: 'temp-' + Date.now(),
        from_id: currentUser.id,
        to_id: activeChatUser.id,
        text: textToSend,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, tempMsg])

      await apiRequest('/chat/messages/', {
        method: 'POST',
        body: {
          to_id: activeChatUser.id,
          text: textToSend
        }
      })
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Failed to send message. Please try again.')
    }
  }

  const openUserChat = (user) => {
    setActiveChatUser(user)
    setShowEmojiPicker(false)
  }

  const onEmojiClick = (emojiObject) => {
    setInputText(prev => prev + emojiObject.emoji)
  }

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Calculate unread counts
  const totalUnread = messages.filter(m => m.to_id === currentUser.id && !readMsgIds.has(m.id)).length

  // Filter messages for active chat
  const activeMessages = activeChatUser 
    ? messages.filter(m => 
        (m.from_id === currentUser.id && m.to_id === activeChatUser.id) ||
        (m.from_id === activeChatUser.id && m.to_id === currentUser.id)
      )
    : []

  if (!currentUser) return null

  return (
    <div className="floating-chat-wrapper">
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={handleOpenChat} aria-label="Open Chat">
          <MessageSquare size={20} />
          <span className="chat-toggle-text">Chat with Students and Teachers</span>
          {onlineUsers.length > 0 && (
            <span className="online-badge" title={`${onlineUsers.length} online`}>
              <span className="status-dot-small"></span> {onlineUsers.length}
            </span>
          )}
          {totalUnread > 0 && <span className="badge">{totalUnread}</span>}
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>
              <MessageSquare size={18} />
              {activeChatUser ? 'Private Chat' : 'Online Students'}
            </h3>
            <button className="close-btn" onClick={handleCloseChat}>
              <X size={20} />
            </button>
          </div>

          <div className="chat-body">
            {!activeChatUser ? (
              // Users List View
              <div className="users-list">
                <h4>Online Now ({onlineUsers.length})</h4>
                {onlineUsers.length === 0 ? (
                  <p className="no-users">No other students are online right now.</p>
                ) : (
                  onlineUsers.map(user => {
                    const userUnread = messages.filter(m => m.from_id === user.id && m.to_id === currentUser.id && !readMsgIds.has(m.id)).length
                    
                    return (
                      <div key={user.id} className="user-item" onClick={() => openUserChat(user)} style={{ position: 'relative' }}>
                        <Avatar name={user.name} size={40} color={user.avatar_color} icon={user.avatar_icon} />
                        <div className="user-info">
                          <div className="user-name">
                            {user.name}
                            {user.role && user.role !== 'student' && (
                              <span className="badge badge-primary" style={{ marginLeft: 8, fontSize: '0.65rem' }}>
                                {user.role === 'main_admin' ? 'Super Admin' : 'Admin'}
                              </span>
                            )}
                          </div>
                          <div className="user-status">
                            <span className="status-dot"></span> Online
                          </div>
                        </div>
                        {userUnread > 0 && (
                          <div className="unread-badge" style={{ position: 'absolute', right: 16 }}>
                            {userUnread}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              // Active Chat View
              <div className="active-chat">
                <div className="active-chat-header">
                  <button className="back-btn" onClick={() => setActiveChatUser(null)}>
                    <ChevronLeft size={20} />
                  </button>
                  <Avatar
                    name={activeChatUser.name}
                    size={28}
                    color={activeChatUser.avatar_color}
                    icon={activeChatUser.avatar_icon}
                  />
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{activeChatUser.name}</div>
                </div>

                <div className="messages-area">
                  {activeMessages.length === 0 ? (
                    <p className="no-users" style={{ marginTop: 'auto', marginBottom: 'auto' }}>Say hi to {activeChatUser.name}!</p>
                  ) : (
                    activeMessages.map(msg => {
                      const isSent = msg.from_id === currentUser.id
                      return (
                        <div key={msg.id} className={`message-bubble ${isSent ? 'msg-sent' : 'msg-received'}`}>
                          {msg.text}
                          <span className="message-time">{formatTime(msg.timestamp)}</span>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-wrapper">
                  {showEmojiPicker && (
                    <div className="emoji-picker-container">
                      <Picker onEmojiClick={onEmojiClick} width={300} height={350} searchDisabled />
                    </div>
                  )}
                  <form className="chat-input-area" onSubmit={handleSendMessage}>
                    <button type="button" className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                      <Smile size={20} />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                    />
                    <button type="submit" disabled={!inputText.trim()}>
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FloatingChat
