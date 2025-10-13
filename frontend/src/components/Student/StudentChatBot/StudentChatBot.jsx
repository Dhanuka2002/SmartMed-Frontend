import React, { useState, useRef, useEffect } from "react";
import "./StudentChatBot.css";

// Icons
import { FiSend, FiUser, FiMessageCircle } from "react-icons/fi";

function StudentChatBot() {
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: "Hello! I'm your medical assistant. I can help answer questions about medical topics, health information, and general medical guidance. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_KEY = "AIzaSyDnO9U-pGPjFKnE4Vtb2R8yinczGQnCOm4";
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful medical assistant for students. Provide accurate, helpful medical information and guidance in a well-structured format.

FORMATTING GUIDELINES:
- Use clear paragraphs separated by double line breaks
- Use numbered lists (1. 2. 3.) for step-by-step information
- Use bullet points (•) for listing items
- Use **bold text** for important terms or warnings
- Use proper headers (## Main Topic, ### Subtopic) when appropriate
- Always organize information clearly with proper spacing

Always remind users to consult healthcare professionals for serious medical issues.

User question: ${inputMessage}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage = {
        type: "bot",
        content: data.candidates[0].content.parts[0].text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        type: "bot",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later or consult with a healthcare professional for immediate medical concerns.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to format AI response text with proper structure
  const formatResponse = (text) => {
    if (!text) return text;

    // Split by double line breaks for paragraphs
    let formattedText = text.replace(/\n\n/g, '||PARAGRAPH||');

    // Handle numbered lists (1. 2. 3. etc.)
    formattedText = formattedText.replace(/(\d+\.\s)/g, '||NEWLINE||$1');

    // Handle bullet points with various symbols
    formattedText = formattedText.replace(/([•·*-]\s)/g, '||NEWLINE||$1');

    // Handle bold text (**text** or __text__)
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Remove single asterisks that aren't part of bold formatting
    formattedText = formattedText.replace(/\*([^*\n]+?)\*/g, '$1');

    // Remove any remaining isolated asterisks
    formattedText = formattedText.replace(/\*/g, '');

    // Handle headers (### Header)
    formattedText = formattedText.replace(/###\s(.*?)(\n|$)/g, '||PARAGRAPH||<h3>$1</h3>||PARAGRAPH||');
    formattedText = formattedText.replace(/##\s(.*?)(\n|$)/g, '||PARAGRAPH||<h2>$1</h2>||PARAGRAPH||');

    // Split into parts and create JSX elements
    const parts = formattedText.split('||PARAGRAPH||').filter(part => part.trim());

    return parts.map((part, index) => {
      if (part.includes('||NEWLINE||')) {
        const lines = part.split('||NEWLINE||').filter(line => line.trim());
        return (
          <div key={index} className="response-section">
            {lines.map((line, lineIndex) => (
              <div key={lineIndex} className="response-line" dangerouslySetInnerHTML={{ __html: line.trim() }} />
            ))}
          </div>
        );
      } else {
        return (
          <div key={index} className="response-paragraph" dangerouslySetInnerHTML={{ __html: part.trim() }} />
        );
      }
    });
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <FiMessageCircle size={24} className="chatbot-header-icon" />
          <h2>Medical Assistant ChatBot</h2>
        </div>
        <p className="chatbot-subtitle">Ask questions about medical topics and health information</p>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === "user" ? (
                <FiUser size={16} />
              ) : (
                <FiMessageCircle size={16} />
              )}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.type === "bot" ? formatResponse(message.content) : message.content}
              </div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">
              <FiMessageCircle size={16} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about medical topics, symptoms, treatments, or general health information..."
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            <FiSend size={18} />
          </button>
        </div>
        <div className="disclaimer">
          <small>
            ⚠️ This AI provides general information only. Always consult healthcare professionals for medical advice.
          </small>
        </div>
      </div>
    </div>
  );
}

export default StudentChatBot;