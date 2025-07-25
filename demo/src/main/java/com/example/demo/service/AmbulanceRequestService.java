package com.example.demo.service;

import com.example.demo.model.AmbulanceRequest;
import com.example.demo.repository.AmbulanceRequestRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class AmbulanceRequestService {

    private final AmbulanceRequestRepository repository;

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    @Value("${twilio.driver.phone}")
    private String driverPhoneNumber;

    public AmbulanceRequestService(AmbulanceRequestRepository repository) {
        this.repository = repository;
    }

    public AmbulanceRequest createRequest(AmbulanceRequest request) {
        // Save to DB only for now
        AmbulanceRequest saved = repository.save(request);

        // ✅ TEMP: Twilio code is commented out for testing
        
        Twilio.init(accountSid, authToken);

        String text = "🚑 EMERGENCY!\n" +
                      "Requested By: " + request.getRequestedBy() + "\n" +
                      "Message: " + request.getMessage();

        Message.creator(
                new PhoneNumber(driverPhoneNumber),
                new PhoneNumber(twilioPhoneNumber),
                text
        ).create();
        

        return saved;
    }
}
