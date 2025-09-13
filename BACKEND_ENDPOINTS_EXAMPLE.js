// Example backend implementation for telemedicine video calls
// Add these routes to your existing backend server

const express = require('express');
const router = express.Router();

// In-memory storage for demo (use database in production)
let videoCallRequests = [];

// 1. Student sends video call request
router.post('/telemed/video-call-request', (req, res) => {
  try {
    const { studentId, studentName, studentEmail, roomName, doctorId } = req.body;

    const request = {
      id: Date.now().toString(),
      studentId,
      studentName: studentName || 'Student User',
      studentEmail,
      doctorId: doctorId || null, // null means any available doctor
      roomName,
      status: 'pending',
      timestamp: new Date().toISOString(),
      createdAt: Date.now()
    };

    videoCallRequests.push(request);

    console.log('Video call request received:', request);

    res.json({
      success: true,
      requestId: request.id,
      message: 'Video call request sent to doctor'
    });

  } catch (error) {
    console.error('Error processing video call request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process video call request'
    });
  }
});

// 2. Check video call request status (for student polling)
router.get('/telemed/video-call-status/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;
    const request = videoCallRequests.find(r => r.id === requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.json({
      success: true,
      status: request.status,
      roomName: request.roomName,
      doctorInfo: request.doctorInfo || null
    });

  } catch (error) {
    console.error('Error checking video call status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check request status'
    });
  }
});

// 3. Get pending video call requests (for doctor polling)
router.get('/telemed/pending-requests', (req, res) => {
  try {
    // Get all pending requests (or filter by doctor ID if specified)
    const pendingRequests = videoCallRequests.filter(r => r.status === 'pending');

    res.json({
      success: true,
      requests: pendingRequests
    });

  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending requests',
      requests: []
    });
  }
});

// 4. Doctor accepts video call request
router.post('/telemed/accept-request/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;
    const { doctorInfo } = req.body;

    const requestIndex = videoCallRequests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Update request status
    videoCallRequests[requestIndex].status = 'accepted';
    videoCallRequests[requestIndex].doctorInfo = doctorInfo;
    videoCallRequests[requestIndex].acceptedAt = new Date().toISOString();

    const request = videoCallRequests[requestIndex];

    console.log('Video call request accepted:', request);

    res.json({
      success: true,
      roomName: request.roomName,
      studentInfo: {
        id: request.studentId,
        name: request.studentName,
        email: request.studentEmail
      }
    });

  } catch (error) {
    console.error('Error accepting video call:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept video call'
    });
  }
});

// 5. Doctor declines video call request
router.post('/telemed/decline-request/:requestId', (req, res) => {
  try {
    const { requestId } = req.params;

    const requestIndex = videoCallRequests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    // Update request status
    videoCallRequests[requestIndex].status = 'declined';
    videoCallRequests[requestIndex].declinedAt = new Date().toISOString();

    console.log('Video call request declined:', requestId);

    res.json({
      success: true
    });

  } catch (error) {
    console.error('Error declining video call:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decline video call'
    });
  }
});

// 6. Cleanup old requests (called periodically)
router.post('/telemed/cleanup-old-requests', (req, res) => {
  try {
    const { maxAge = 24 * 60 * 60 * 1000 } = req.body; // 24 hours default
    const cutoffTime = Date.now() - maxAge;

    const initialCount = videoCallRequests.length;
    videoCallRequests = videoCallRequests.filter(r => r.createdAt > cutoffTime);
    const removedCount = initialCount - videoCallRequests.length;

    console.log(`Cleaned up ${removedCount} old video call requests`);

    res.json({
      success: true,
      removedCount
    });

  } catch (error) {
    console.error('Error cleaning up requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup old requests'
    });
  }
});

// Export the router
module.exports = router;

/*
USAGE INSTRUCTIONS:

1. Add this to your main backend server file (app.js or server.js):

   const telemedRoutes = require('./routes/telemedicine'); // adjust path
   app.use('/api', telemedRoutes);

2. Make sure your backend supports CORS for your frontend domain

3. Test the endpoints:
   - POST http://localhost:8081/api/telemed/video-call-request
   - GET  http://localhost:8081/api/telemed/pending-requests
   - etc.

4. For production, replace the in-memory storage with a proper database

SAMPLE TEST DATA:

POST /api/telemed/video-call-request
{
  "studentId": "STU001",
  "studentName": "John Doe",
  "studentEmail": "john@example.com",
  "roomName": "SmartMed-12345",
  "doctorId": null
}

Expected Response:
{
  "success": true,
  "requestId": "1234567890",
  "message": "Video call request sent to doctor"
}
*/