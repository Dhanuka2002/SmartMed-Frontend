# 🚨 Twilio SMS Setup Guide for Emergency Ambulance Alerts

## Prerequisites
1. A Twilio account (sign up at https://www.twilio.com)
2. A verified phone number in Twilio
3. Twilio SMS-enabled phone number

## Step 1: Get Twilio Credentials

### 1.1 Create Twilio Account
- Go to https://www.twilio.com and sign up
- Verify your email and phone number
- Complete the account setup

### 1.2 Get Account Credentials
- Login to Twilio Console: https://console.twilio.com/
- Find your **Account SID** and **Auth Token** on the dashboard
- **IMPORTANT**: Keep these credentials secure and never commit them to git

### 1.3 Get a Phone Number
- Go to Phone Numbers → Manage → Buy a Number
- Choose a number with SMS capability
- Purchase the number (note: this will cost money)

## Step 2: Configure Environment Variables

### 2.1 Create .env file
```bash
cp .env.example .env
```

### 2.2 Update .env with your Twilio credentials
```env
REACT_APP_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_TWILIO_PHONE_NUMBER=+1234567890
```

## Step 3: Backend API Setup (Recommended for Production)

### 3.1 Why Backend API?
- **Security**: Never expose Twilio credentials in frontend
- **Rate Limiting**: Control SMS sending frequency
- **Logging**: Track emergency alerts and delivery status
- **Authentication**: Ensure only authorized users can send alerts

### 3.2 Create Backend Endpoint
Create an endpoint in your backend API:

```javascript
// Example Node.js/Express endpoint
app.post('/api/send-emergency-sms', async (req, res) => {
  try {
    // Verify user authentication
    const user = await verifyAuthToken(req.headers.authorization);
    
    // Validate request
    const { to, message, metadata } = req.body;
    
    // Send SMS via Twilio
    const twilioClient = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    const messageInstance = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    // Log the emergency alert
    await logEmergencyAlert({
      userId: user.id,
      driverPhone: to,
      messageId: messageInstance.sid,
      metadata: metadata
    });
    
    res.json({
      messageId: messageInstance.sid,
      status: messageInstance.status
    });
    
  } catch (error) {
    console.error('SMS sending error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});
```

## Step 4: Test the Integration

### 4.1 Development Testing
1. Set `NODE_ENV=development` in your .env
2. Add test phone numbers in Twilio Console
3. Use the Emergency Ambulance Request feature
4. Check Twilio Console logs for message delivery

### 4.2 Production Testing
1. Set up backend API endpoint
2. Configure production environment variables
3. Test with real phone numbers
4. Monitor delivery rates and responses

## Step 5: Phone Number Validation

The system validates Sri Lankan phone numbers by default:
- Format: +94XXXXXXXXX or 0XXXXXXXXX
- Automatically converts local format to international

To support other countries, update the validation in `twilioService.js`:

```javascript
validatePhoneNumber(phoneNumber) {
  // Add your country's phone number pattern
  const patterns = {
    sriLanka: /^(\+94|0)[0-9]{9}$/,
    usa: /^(\+1|1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/,
    uk: /^(\+44|0)[1-9]\d{8,9}$/
  };
  
  return Object.values(patterns).some(pattern => pattern.test(phoneNumber));
}
```

## Step 6: Security Best Practices

### 6.1 Environment Variables
- Never commit .env files to version control
- Use different credentials for development/production
- Rotate credentials regularly

### 6.2 Backend Security
- Implement proper authentication
- Add rate limiting to prevent spam
- Log all emergency alerts
- Validate all inputs

### 6.3 Error Handling
- Graceful fallback for SMS failures
- Clear error messages for users
- Retry mechanisms for critical alerts

## Step 7: Monitoring and Analytics

### 7.1 Twilio Console
- Monitor message delivery rates
- Track costs and usage
- Set up alerts for failures

### 7.2 Application Logging
- Log all emergency requests
- Track response times
- Monitor driver response rates

## Emergency Message Format

The system sends SMS in this format:
```
🚨 EMERGENCY AMBULANCE REQUEST 🚨

Patient: John Doe, 45, chest pain, needs oxygen
Location: SmartMed Hospital, Room 302
Type: CRITICAL
Time: 2024-01-15 14:30:25

Please respond immediately if available.

SmartMed Hospital
Emergency Hotline: +94 11 234 5678

Reply ACCEPT to confirm or call back immediately.
```

## Costs and Pricing

- Twilio SMS pricing varies by country
- Sri Lanka: ~$0.05 per SMS
- Monitor usage in Twilio Console
- Set up billing alerts

## Support and Troubleshooting

### Common Issues:
1. **Invalid phone number**: Check format and country code
2. **Authentication failed**: Verify Account SID and Auth Token
3. **Message not delivered**: Check phone number validity and carrier support
4. **Rate limits**: Implement retry logic with delays

### Twilio Support:
- Documentation: https://www.twilio.com/docs/sms
- Support: https://support.twilio.com/
- Status page: https://status.twilio.com/

## Production Deployment Checklist

- [ ] Backend API endpoint implemented
- [ ] Environment variables configured
- [ ] Phone numbers validated and tested
- [ ] Error handling implemented
- [ ] Logging and monitoring set up
- [ ] Rate limiting configured
- [ ] Security measures in place
- [ ] Cost monitoring enabled
- [ ] Backup communication methods ready

---

**⚠️ IMPORTANT**: This emergency system handles critical healthcare communications. Ensure thorough testing and have backup communication methods available.