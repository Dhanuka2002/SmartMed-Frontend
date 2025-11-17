// ============================================
// IMPORTS
// ============================================

// React core imports for component functionality
import React, { useState, useRef, useEffect } from "react";
// Component-specific styles
import "./StudentChatBot.css";

// Icon library for UI elements
import { FiSend, FiUser, FiMessageCircle } from "react-icons/fi";

/**
 * StudentChatBot Component
 * 
 * AI-powered medical assistant chatbot that:
 * - Provides medical information and health guidance to students
 * - Uses Google's Gemini AI API for intelligent responses
 * - Formats responses with proper structure (lists, bold text, headers)
 * - Maintains conversation history
 * - Auto-scrolls to latest messages
 * 
 * @component
 * @returns {JSX.Element} Interactive chatbot interface
 */
function StudentChatBot() {
  // ========================================
  // STATE MANAGEMENT
  // ==========================================================
  // STATE MANAGEMENT
  // ========================================
  
  /**
   * Messages array storing conversation history
   * Each message has: type (user/bot), content (text), timestamp
   * Initialized with welcome message from bot
   */
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: "Hello! I'm your medical assistant. I can help answer questions about medical topics, health information, and general medical guidance. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  
  // Stores current user input text
  const [inputMessage, setInputMessage] = useState("");
  
  // Tracks if AI is processing request (shows loading indicator)
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference to messages end element for auto-scrolling
  const messagesEndRef = useRef(null);

  // ========================================
  // API CONFIGURATION
  // ========================================
  
  // Google Gemini API key for authentication
  const API_KEY = "AIzaSyDnO9U-pGPjFKnE4Vtb2R8yinczGQnCOm4";
  
  // Gemini 2.0 Flash API endpoint for content generation
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  /**
   * Scrolls chat messages to bottom to show latest message
   * Uses smooth scrolling animation for better UX
   */
  const scrollToBottom = () => {
    // Optional chaining prevents errors if ref is not yet attached
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ========================================
  // LIFECYCLE HOOKS
  // ========================================
  
  /**
   * Auto-scroll to bottom whenever messages array changes
   * Ensures user always sees the latest message
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Dependency: re-run when messages change // Dependency: re-run when messages change

  // ========================================
  // MESSAGE HANDLING
  // ========================================
  
  /**
   * Sends user message to Gemini AI and handles response
   * 
   * Process:
   * 1. Validates and adds user message to chat
   * 2. Sends request to Gemini API with formatting instructions
   * 3. Parses AI response and adds to chat
   * 4. Handles errors gracefully
   * 
   * @async
   * @returns {Promise<void>}
   */
  const sendMessage = async () => {
    // Validate input - return early if empty or whitespace only
    if (!inputMessage.trim()) return;

    // Create user message object
    const userMessage = {
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    // Add user message to chat immediately
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input field for next message
    setInputMessage("");
    
    // Show loading indicator while waiting for AI response
    setIsLoading(true);

    try {
      // === SEND REQUEST TO GEMINI API ===
      // === SEND REQUEST TO GEMINI API ===
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Message content with system prompt and user question
          contents: [
            {
              parts: [
                {
                  // System prompt defines AI behavior and formatting rules
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
          // AI generation parameters for response quality
          generationConfig: {
            temperature: 0.7,    // Controls randomness (0.0-1.0, lower = more focused)
            topP: 0.8,           // Nucleus sampling threshold
            topK: 40,            // Limits vocabulary to top K tokens
            maxOutputTokens: 1024, // Maximum response length
          }
        })
      });

      // Check if API request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse JSON response from API
      const data = await response.json();

      // Extract AI-generated text from response structure
      const botMessage = {
        type: "bot",
        content: data.candidates[0].content.parts[0].text,
        timestamp: new Date()
      };

      // Add bot response to chat
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      // Log error for debugging
      console.error("Error sending message:", error);
      
      // Show user-friendly error message in chat
      const errorMessage = {
        type: "bot",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later or consult with a healthcare professional for immediate medical concerns.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      // Always hide loading indicator when done (success or error)
      setIsLoading(false);
    }
  };

  /**
   * Handles keyboard input in textarea
   * Enter key sends message, Shift+Enter adds new line
   * 
   * @param {KeyboardEvent} e - Keyboard event object
   */
  const handleKeyPress = (e) => {
    // Send message on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default newline behavior
      sendMessage();
    }
    // Shift+Enter allows multi-line input (default behavior)
  };

  /**
   * Formats timestamp to readable time string (HH:MM)
   * 
   * @param {Date} timestamp - Message timestamp
   * @returns {string} Formatted time string
   */
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ========================================
  // TEXT FORMATTING
  // ========================================
  
  /**
   * Formats AI response text with proper HTML structure
   * 
   * Handles:
   * - Paragraphs (double line breaks)
   * - Numbered lists (1. 2. 3.)
   * - Bullet points (• · * -)
   * - Bold text (**text** or __text__)
   * - Headers (## ###)
   * 
   * @param {string} text - Raw AI response text
   * @returns {JSX.Element[]} Array of formatted JSX elements
   */
  const formatResponse = (text) => {
    // Return early if text is empty or null
    if (!text) return text;

    // === STEP 1: Split paragraphs ===
    // Replace double line breaks with paragraph markers
    let formattedText = text.replace(/\n\n/g, '||PARAGRAPH||');

    // === STEP 2: Format lists ===
    // Add line breaks before numbered list items (1. 2. 3. etc.)
    formattedText = formattedText.replace(/(\d+\.\s)/g, '||NEWLINE||$1');

    // Add line breaks before bullet points (• · * -)
    formattedText = formattedText.replace(/([•·*-]\s)/g, '||NEWLINE||$1');

    // === STEP 3: Format bold text ===
    // Convert **text** to <strong>text</strong>
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert __text__ to <strong>text</strong>
    formattedText = formattedText.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // === STEP 4: Clean up asterisks ===
    // Remove single asterisks that aren't part of bold formatting
    formattedText = formattedText.replace(/\*([^*\n]+?)\*/g, '$1');
    // Remove any remaining isolated asterisks
    formattedText = formattedText.replace(/\*/g, '');

    // === STEP 5: Format headers ===
    // Convert ### Header to <h3>Header</h3>
    formattedText = formattedText.replace(/###\s(.*?)(\n|$)/g, '||PARAGRAPH||<h3>$1</h3>||PARAGRAPH||');
    // Convert ## Header to <h2>Header</h2>
    formattedText = formattedText.replace(/##\s(.*?)(\n|$)/g, '||PARAGRAPH||<h2>$1</h2>||PARAGRAPH||');;
    // Convert ## Header to <h2>Header</h2>
    formattedText = formattedText.replace(/##\s(.*?)(\n|$)/g, '||PARAGRAPH||<h2>$1</h2>||PARAGRAPH||');

    // === STEP 6: Create JSX elements ===
    // Split by paragraph markers and filter empty parts
    const parts = formattedText.split('||PARAGRAPH||').filter(part => part.trim());

    // Map each part to appropriate JSX element
    return parts.map((part, index) => {
      // If part contains line breaks (lists), render as section with multiple lines
      if (part.includes('||NEWLINE||')) {
        const lines = part.split('||NEWLINE||').filter(line => line.trim());
        return (
          <div key={index} className="response-section">
            {lines.map((line, lineIndex) => (
              // dangerouslySetInnerHTML allows HTML tags to render properly
              <div key={lineIndex} className="response-line" dangerouslySetInnerHTML={{ __html: line.trim() }} />
            ))}
          </div>
        );
      } else {
        // Regular paragraph without line breaks
        return (
          <div key={index} className="response-paragraph" dangerouslySetInnerHTML={{ __html: part.trim() }} />
        );
      }
    });
  };

  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div className="chatbot-container">
      {/* ===================================
          HEADER SECTION
          - Displays chatbot title and icon
          - Shows subtitle with usage information
          =================================== */}
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <FiMessageCircle size={24} className="chatbot-header-icon" />
          <h2>Medical Assistant ChatBot</h2>
        </div>
        <p className="chatbot-subtitle">Ask questions about medical topics and health information</p>
      </div>

      {/* ===================================
          MESSAGES DISPLAY SECTION
          - Shows conversation history
          - Different styling for user/bot messages
          - Formats bot responses with structure
          - Displays loading indicator
          =================================== */}
      <div className="chatbot-messages">
        {/* Map through all messages and render each */}
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {/* Avatar icon - different for user vs bot */}
            <div className="message-avatar">
              {message.type === "user" ? (
                <FiUser size={16} />
              ) : (
                <FiMessageCircle size={16} />
              )}
            </div>
            {/* Message content and timestamp */}
            <div className="message-content">
              <div className="message-text">
                {/* Format bot responses, show user messages as-is */}
                {message.type === "bot" ? formatResponse(message.content) : message.content}
              </div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}

        {/* Loading indicator - shown while waiting for AI response */}
        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">
              <FiMessageCircle size={16} />
            </div>
            <div className="message-content">
              {/* Animated typing indicator (3 dots) */}
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* Invisible element at bottom for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* ===================================
          INPUT SECTION
          - Text input for user messages
          - Send button
          - Medical disclaimer
          =================================== */}
      <div className="chatbot-input">
        <div className="input-container">
          {/* Textarea for user input */}
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress} // Send on Enter, new line on Shift+Enter
            placeholder="Ask me about medical topics, symptoms, treatments, or general health information..."
            rows={1}
            disabled={isLoading} // Disable while AI is responding
          />
          {/* Send button - disabled if input empty or loading */}
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            <FiSend size={18} />
          </button>
        </div>
        {/* Medical disclaimer - reminds users to consult professionals */}
        <div className="disclaimer">
          <small>
            ⚠️ This AI provides general information only. Always consult healthcare professionals for medical advice.
          </small>
        </div>
      </div>
    </div>
  );
}

// Export component as default export for use in routing
export default StudentChatBot;