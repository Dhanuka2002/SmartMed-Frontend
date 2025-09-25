# Student ChatBot Test Cases

## Overview
Comprehensive test cases for the StudentChatBot component - a medical assistant chatbot that uses Google Gemini API to provide medical information and health guidance to students.

---

## 1. USER INTERFACE TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| UI-001 | Verify chatbot interface renders correctly on page load | 1. Navigate to StudentChatBot component<br>2. Wait for component to fully load<br>3. Observe all UI elements | N/A | - Header displays "Medical Assistant ChatBot" with message circle icon<br>- Subtitle shows "Ask questions about medical topics and health information"<br>- Initial bot welcome message is visible<br>- Message input textarea is present<br>- Send button with send icon is visible<br>- Disclaimer message appears at bottom |
| UI-002 | Verify initial application state | 1. Load the chatbot component<br>2. Check message count<br>3. Check input field state<br>4. Check button states | N/A | - Exactly one welcome message from bot present<br>- Input field is empty<br>- Send button is disabled<br>- No loading indicator visible<br>- Welcome message has timestamp |
| UI-003 | Verify responsive design on mobile devices | 1. Open chatbot on mobile device<br>2. Test portrait and landscape orientations<br>3. Check all UI elements | Mobile device or browser dev tools | - Interface adapts to screen size<br>- All elements remain accessible<br>- Text input works with mobile keyboard<br>- Send button remains functional |

---

## 2. INPUT VALIDATION TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| IV-001 | Test empty message validation | 1. Leave input field empty<br>2. Click send button<br>3. Observe behavior | Empty string "" | - Send button remains disabled<br>- No message is sent<br>- No API call is made<br>- Input field remains empty |
| IV-002 | Test whitespace only message validation | 1. Enter only spaces in input field<br>2. Click send button<br>3. Observe behavior | "   " (spaces only) | - Send button remains disabled<br>- No message is sent<br>- Input field remains with spaces |
| IV-003 | Test valid message input | 1. Type message in input field<br>2. Verify send button state<br>3. Click send button<br>4. Observe message flow | "What is high blood pressure?" | - Send button becomes enabled while typing<br>- User message appears in chat<br>- Input field clears after sending<br>- Loading indicator appears<br>- Bot response follows |
| IV-004 | Test Enter key message sending | 1. Type message in input field<br>2. Press Enter key<br>3. Observe behavior | "Tell me about diabetes" | - Message is sent automatically<br>- Same behavior as clicking send button |
| IV-005 | Test Shift+Enter for new line | 1. Type message in input field<br>2. Press Shift+Enter<br>3. Continue typing<br>4. Press Enter to send | "First line\nSecond line" | - Shift+Enter creates new line without sending<br>- Regular Enter sends the multi-line message |

---

## 3. MEDICAL QUERY TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| MQ-001 | Test general health symptom question | 1. Enter symptom question<br>2. Send message<br>3. Wait for response<br>4. Analyze response format | "What are the symptoms of flu?" | - Well-formatted response with symptoms list<br>- Use of bullet points or numbered list<br>- Bold formatting for important terms<br>- Reminder to consult healthcare professional |
| MQ-002 | Test medication information query | 1. Enter medication question<br>2. Send message<br>3. Review response content | "What is paracetamol used for?" | - Information about medication usage<br>- Dosage guidelines if appropriate<br>- Potential side effects mentioned<br>- Professional consultation reminder included |
| MQ-003 | Test symptom description with mild concern | 1. Enter symptom description<br>2. Send message<br>3. Evaluate response appropriateness | "I have a persistent headache and feel dizzy" | - General information about possible causes<br>- Clear advice to consult healthcare professional<br>- No attempt at specific diagnosis<br>- Appropriate level of concern expressed |
| MQ-004 | Test emergency-like symptom reporting | 1. Enter serious symptom description<br>2. Send message<br>3. Check response urgency | "I have severe chest pain and shortness of breath" | - Immediate recommendation to seek emergency care<br>- Clear urgency indicators in response<br>- Emergency contact advice if appropriate<br>- Strong emphasis on immediate professional help |
| MQ-005 | Test preventive health question | 1. Enter prevention/wellness question<br>2. Send message<br>3. Review response structure | "How can I maintain a healthy diet?" | - Structured diet guidelines<br>- Numbered or bulleted list format<br>- Bold formatting for key nutritional points<br>- Practical, actionable advice |
| MQ-006 | Test complex medical terminology query | 1. Enter medical term question<br>2. Send message<br>3. Check explanation clarity | "What is myocardial infarction?" | - Clear explanation in understandable terms<br>- Medical term properly defined<br>- Symptoms and causes if appropriate<br>- Professional consultation advice |
| MQ-007 | Test mental health question | 1. Enter mental health query<br>2. Send message<br>3. Assess response sensitivity | "What are the symptoms of anxiety?" | - Sensitive, non-judgmental response<br>- Accurate symptom information<br>- Strong emphasis on professional mental health support<br>- Resource recommendations if appropriate |

---

## 4. RESPONSE FORMATTING TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| RF-001 | Test bold text formatting in responses | 1. Ask question likely to trigger bold formatting<br>2. Send message<br>3. Inspect response HTML | "What are the warning signs of stroke?" | - Important terms appear in bold using `<strong>` tags<br>- Bold formatting renders correctly in UI<br>- Emergency terms like **URGENT** properly emphasized |
| RF-002 | Test numbered list formatting | 1. Ask question requiring step-by-step response<br>2. Send message<br>3. Check list structure | "What are the steps to treat a minor cut?" | - Numbered list format (1. 2. 3.)<br>- Proper line breaks between items<br>- Clear step-by-step progression<br>- Proper HTML list structure |
| RF-003 | Test bullet point formatting | 1. Ask question requiring list of items<br>2. Send message<br>3. Verify list display | "What foods are good for heart health?" | - Bullet points (• or -) properly formatted<br>- Items clearly separated<br>- Consistent formatting throughout |
| RF-004 | Test header formatting in responses | 1. Ask comprehensive question<br>2. Send message<br>3. Check header structure | "Tell me about different types of headaches" | - Main headings (##) for major categories<br>- Sub-headings (###) for specific types<br>- Proper HTML header tags (`<h2>`, `<h3>`)<br>- Logical information hierarchy |

---

## 5. ERROR HANDLING TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| EH-001 | Test network connection error handling | 1. Disconnect internet connection<br>2. Send any message<br>3. Observe error handling | "What is fever?" | - Error message displayed: "I'm sorry, I'm having trouble connecting right now..."<br>- Loading indicator stops<br>- Previous messages remain visible<br>- User can still attempt to send messages |
| EH-002 | Test API timeout handling | 1. Mock slow API response<br>2. Send message<br>3. Wait for timeout<br>4. Observe behavior | "Tell me about heart disease" | - Appropriate timeout handling<br>- Error message after reasonable wait<br>- System remains functional<br>- Loading indicator stops appropriately |
| EH-003 | Test invalid API response handling | 1. Mock invalid/corrupted API response<br>2. Send message<br>3. Check error handling | "What is blood pressure?" | - Graceful error handling<br>- User-friendly error message<br>- Application doesn't crash<br>- User can continue chatting |
| EH-004 | Test API rate limiting scenario | 1. Send multiple rapid messages<br>2. Trigger rate limit (if applicable)<br>3. Observe system behavior | Multiple quick messages | - Graceful handling of rate limit errors<br>- Appropriate user feedback<br>- System recovers when limit resets |

---

## 6. PERFORMANCE TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| PT-001 | Test performance with long message history | 1. Send 50+ messages<br>2. Observe performance metrics<br>3. Check scroll behavior<br>4. Monitor memory usage | 50 varied medical questions | - Auto-scroll to latest message works<br>- No significant UI lag<br>- All messages remain accessible<br>- Memory usage stays reasonable |
| PT-002 | Test large response handling | 1. Ask comprehensive medical question<br>2. Wait for long response<br>3. Check display performance | "Tell me everything about cardiovascular diseases" | - Long responses display properly<br>- Formatting maintained throughout<br>- No UI breaking or overflow<br>- Scroll functionality works smoothly |
| PT-003 | Test rapid message sending | 1. Send 10 messages quickly<br>2. Observe system behavior<br>3. Check message order | 10 quick medical questions | - Messages queue properly<br>- No lost messages<br>- Loading states handled correctly<br>- Responses arrive in correct order |

---

## 7. ACCESSIBILITY TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| AC-001 | Test keyboard navigation | 1. Use Tab key to navigate interface<br>2. Test Enter key functionality<br>3. Test Shift+Enter behavior | Navigate using keyboard only | - All interactive elements accessible via keyboard<br>- Clear focus indicators visible<br>- Enter key sends messages correctly<br>- Tab navigation logical and complete |
| AC-002 | Test screen reader compatibility | 1. Enable screen reader<br>2. Navigate through interface<br>3. Send test message<br>4. Listen to response | "What is diabetes?" | - Messages announced properly by screen reader<br>- Timestamps read correctly<br>- Icons have appropriate alt text or labels<br>- Interface structure clear to screen readers |
| AC-003 | Test high contrast mode | 1. Enable high contrast mode<br>2. Check interface visibility<br>3. Test functionality | Various test messages | - All text remains readable<br>- Interactive elements clearly visible<br>- Color contrast meets accessibility standards<br>- Functionality preserved |

---

## 8. EDGE CASE TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| EC-001 | Test very long input message | 1. Enter 1000+ character message<br>2. Send message<br>3. Check handling | 1000+ character medical question | - Message accepted and sent<br>- UI handles long text properly<br>- Response processes long context<br>- No interface breaking |
| EC-002 | Test special characters and emojis | 1. Enter message with special characters<br>2. Send message<br>3. Check display | "What about COVID-19 🦠 and H₂O?" | - Special characters display correctly<br>- Emojis render properly<br>- No encoding issues<br>- Response handles special chars |
| EC-003 | Test HTML/script injection attempts | 1. Enter potentially malicious input<br>2. Send message<br>3. Verify security | `<script>alert('test')</script>` | - No script execution occurs<br>- Input properly sanitized<br>- Security maintained<br>- Message displays safely |
| EC-004 | Test non-English language input | 1. Enter medical question in different language<br>2. Send message<br>3. Check response | "¿Qué es la diabetes?" (Spanish) | - Appropriate response or language limitation notice<br>- No application crashes<br>- Graceful handling of non-English input |

---

## 9. INTEGRATION TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| IT-001 | Test component navigation integration | 1. Navigate from other student components<br>2. Access chatbot<br>3. Return to previous component<br>4. Return to chatbot | N/A | - Component loads correctly from navigation<br>- State preserved appropriately<br>- Smooth transitions between components<br>- No memory leaks or errors |
| IT-002 | Test API integration functionality | 1. Send various medical queries<br>2. Monitor network requests<br>3. Verify API responses | Multiple varied medical questions | - Correct API endpoint usage<br>- Proper request headers and format<br>- Response parsing works correctly<br>- API key transmitted securely |
| IT-003 | Test local storage integration | 1. Send messages<br>2. Refresh browser<br>3. Check message persistence | "What is hypertension?" | - Message history preserved if applicable<br>- User preferences maintained<br>- No data corruption |

---

## 10. SECURITY TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| ST-001 | Test XSS vulnerability prevention | 1. Enter XSS payload in message<br>2. Send message<br>3. Check for script execution | `<img src=x onerror=alert('XSS')>` | - No script execution<br>- Input properly escaped/sanitized<br>- Safe display of content<br>- Security maintained |
| ST-002 | Test API key security | 1. Open browser developer tools<br>2. Send message<br>3. Inspect network traffic | "What is fever?" | - API key not exposed in client-side code<br>- HTTPS used for API calls<br>- No sensitive data in browser storage<br>- Secure transmission |
| ST-003 | Test input sanitization | 1. Enter various potentially harmful inputs<br>2. Send messages<br>3. Verify sanitization | SQL injection attempts, HTML tags | - All inputs properly sanitized<br>- No code injection possible<br>- Safe content rendering<br>- Application stability maintained |

---

## 11. BROWSER COMPATIBILITY TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| BC-001 | Test Chrome browser compatibility | 1. Open chatbot in Chrome<br>2. Test all functionality<br>3. Check console for errors | "What are vitamins?" | - All features work correctly<br>- No console errors<br>- Proper CSS rendering<br>- API calls successful |
| BC-002 | Test Firefox browser compatibility | 1. Open chatbot in Firefox<br>2. Test all functionality<br>3. Check console for errors | "What are vitamins?" | - Consistent functionality with Chrome<br>- No browser-specific errors<br>- Proper display rendering<br>- Full feature compatibility |
| BC-003 | Test Safari browser compatibility | 1. Open chatbot in Safari<br>2. Test all functionality<br>3. Check console for errors | "What are vitamins?" | - All features work as expected<br>- No Safari-specific issues<br>- Proper CSS and JS execution<br>- API integration works |
| BC-004 | Test Edge browser compatibility | 1. Open chatbot in Edge<br>2. Test all functionality<br>3. Check console for errors | "What are vitamins?" | - Complete functionality maintained<br>- No Edge-specific problems<br>- Consistent user experience<br>- All features accessible |

---

## 12. MOBILE RESPONSIVENESS TESTS

| Test Case ID | Test Description | Test Steps | Test Data | Expected Result |
|--------------|------------------|------------|-----------|-----------------|
| MR-001 | Test iOS Safari mobile compatibility | 1. Open on iOS device<br>2. Test portrait/landscape<br>3. Test touch interactions | "How to prevent flu?" | - Responsive design works properly<br>- Touch interactions function correctly<br>- Virtual keyboard doesn't break layout<br>- All features accessible on mobile |
| MR-002 | Test Android Chrome mobile compatibility | 1. Open on Android device<br>2. Test various screen sizes<br>3. Test mobile-specific features | "What is healthy BMI?" | - Interface adapts to screen size<br>- Android keyboard integration works<br>- Touch gestures work properly<br>- Performance remains good |
| MR-003 | Test tablet responsiveness | 1. Open on tablet device<br>2. Test both orientations<br>3. Check UI scaling | "Tell me about exercise benefits" | - UI scales appropriately for tablet<br>- Optimal use of available space<br>- Touch targets appropriately sized<br>- Good user experience maintained |

---

## TEST DATA REPOSITORY

### Sample Medical Questions for Testing:
1. "What is hypertension?"
2. "How to treat a sprained ankle?"
3. "What are the side effects of ibuprofen?"
4. "I have a fever, what should I do?"
5. "How can I prevent heart disease?"
6. "What is the difference between Type 1 and Type 2 diabetes?"
7. "How much water should I drink daily?"
8. "What are the symptoms of anxiety?"
9. "How to maintain good mental health?"
10. "What foods are good for brain health?"
11. "What is COVID-19?"
12. "How to check blood pressure at home?"
13. "What causes insomnia?"
14. "How to boost immune system naturally?"
15. "What are probiotics?"

### Emergency/Urgent Test Cases:
1. "I'm having chest pain"
2. "Severe allergic reaction"
3. "Difficulty breathing"
4. "Severe headache and vision problems"
5. "Heavy bleeding"

### Complex Medical Terms:
1. "What is pneumonia?"
2. "Explain atherosclerosis"
3. "What is fibromyalgia?"
4. "Tell me about osteoporosis"
5. "What is rheumatoid arthritis?"

---

## AUTOMATED TEST SCRIPT EXAMPLES

### Jest Test Example:
```javascript
describe('StudentChatBot Message Functionality', () => {
  test('TC-IV-003: Should send message and receive response', async () => {
    const { getByPlaceholderText, getByRole, getByText } = render(<StudentChatBot />);
    const input = getByPlaceholderText(/Ask me about medical topics/);
    const sendButton = getByRole('button');

    fireEvent.change(input, { target: { value: 'What is high blood pressure?' } });
    fireEvent.click(sendButton);

    expect(getByText('What is high blood pressure?')).toBeInTheDocument();
    expect(input.value).toBe('');
  });
});
```

---

## CONCLUSION

This comprehensive test suite ensures the StudentChatBot component functions correctly across all scenarios, providing reliable medical information assistance to students while maintaining security, accessibility, and performance standards.