# SmartMed Cross-Device Video Call Setup Guide

## Overview
The video call system has been enhanced to work across different devices/laptops. When a student requests a video call on one laptop, doctors on other laptops will receive real-time notifications.

## How It Works

### For Students (Request Video Call):
1. Login as a student on Laptop A
2. Go to Telemedicine section
3. Click "Request Video Call"
4. System sends request to backend API
5. Wait for doctor to accept (30-second timeout)

### For Doctors (Receive & Accept Calls):
1. Login as a doctor on Laptop B
2. Go to Telemedicine section
3. System automatically polls for incoming requests every 3 seconds
4. When a request arrives:
   - Visual notification appears in the interface
   - Audio notification plays
   - Browser notification (if permissions granted)
5. Click "Accept Call" to join the video conference

## Technical Implementation

### Backend API Endpoints (Required):
The system expects these endpoints on your backend server:

```
POST /api/telemed/video-call-request
- Body: { studentId, studentName, studentEmail, roomName, ... }
- Response: { success: true, requestId: "12345" }

GET /api/telemed/video-call-status/{requestId}
- Response: { success: true, status: "accepted|declined|pending", roomName, doctorInfo }

GET /api/telemed/pending-requests
- Response: { success: true, requests: [...] }

POST /api/telemed/accept-request/{requestId}
- Body: { doctorInfo }
- Response: { success: true, roomName, studentInfo }

POST /api/telemed/decline-request/{requestId}
- Response: { success: true }
```

### Fallback Mode:
If backend is unavailable, system automatically falls back to localStorage for same-device testing.

## Testing Cross-Device Functionality

### Prerequisites:
1. Backend server running on port 8081
2. Two laptops on the same network
3. Both laptops can access the backend server

### Test Steps:

#### Laptop A (Student):
1. Open browser, navigate to your app
2. Login as a student
3. Go to Telemedicine → Request Video Call
4. Click "Request Video Call" button
5. Should see "Request sent to doctor" message
6. Wait for doctor response

#### Laptop B (Doctor):
1. Open browser, navigate to your app
2. Login as a doctor
3. Go to Telemedicine section
4. Should see "Online - Real-time notifications active" status
5. When student makes request, should see:
   - Visual notification in interface
   - Audio notification sound
   - Request box with Accept/Decline buttons
6. Click "Accept Call"
7. Both users should join the same video conference room

## Configuration Files Modified

### New Files Created:
- `frontend/src/services/videoCallService.js` - Cross-device communication
- `VIDEO_CALL_SETUP_GUIDE.md` - This guide

### Files Modified:
- `frontend/src/services/apiService.js` - Added telemedicine endpoints
- `frontend/src/components/Student/StudentTelemed/StudentTelemed.jsx` - Enhanced with real-time communication
- `frontend/src/components/Doctor/DoctorTelemed/DoctorTelemed.jsx` - Enhanced with notifications
- `frontend/src/services/notificationSoundService.js` - Enhanced notifications
- `frontend/.env` - Fixed API URL port

## Backend Requirements

Your backend needs to implement the telemedicine endpoints listed above. Here's a simple example structure:

```javascript
// Example backend route structure
app.post('/api/telemed/video-call-request', (req, res) => {
  // Store request in database with status 'pending'
  // Include: requestId, studentInfo, roomName, timestamp
  res.json({ success: true, requestId: savedRequest.id });
});

app.get('/api/telemed/pending-requests', (req, res) => {
  // Get all pending requests from database
  res.json({ success: true, requests: pendingRequests });
});

// Similar implementation for other endpoints...
```

## Troubleshooting

### Issue: "Offline - Using local storage fallback"
- **Cause**: Backend API not responding
- **Solution**: Ensure backend server is running on port 8081
- **Verify**: Check browser console for API errors

### Issue: No notifications on doctor side
- **Cause**: Polling not working or audio permissions
- **Solution**: Check browser console, allow audio permissions
- **Test**: Manually refresh doctor page

### Issue: Video call doesn't connect
- **Cause**: Jitsi API not loaded or room name mismatch
- **Solution**: Check browser console for Jitsi errors
- **Verify**: Both users should use same room name

### Issue: CORS errors
- **Cause**: Backend CORS configuration
- **Solution**: Configure backend to allow your frontend domain

## Audio Notifications

The system includes audio notifications for doctors:
- Pleasant bell sound for incoming video calls
- Success sound for accepted calls
- Error sound for declined calls

Audio can be disabled in the notification service if needed.

## Security Considerations

1. **Authentication**: All API calls require valid JWT tokens
2. **Room Names**: Generated with timestamp + random string
3. **Permissions**: Only authenticated users can send/receive requests
4. **Cleanup**: Old requests are automatically cleaned up

## Performance

- Polling interval: 3 seconds (configurable)
- Request timeout: 30 seconds
- Automatic cleanup: 24 hours
- Fallback mode: Immediate localStorage access

## Browser Compatibility

- Chrome: Full support
- Firefox: Full support
- Safari: Full support (may need user interaction for audio)
- Edge: Full support

## Next Steps

1. Implement the backend API endpoints
2. Test with two devices on same network
3. Deploy backend to accessible server
4. Test across different networks
5. Add push notifications for mobile devices (future enhancement)

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend API responses
3. Test network connectivity between devices
4. Check authentication tokens are valid