package com.example.demo.controller;

import com.example.demo.model.AmbulanceRequest;
import com.example.demo.service.AmbulanceRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ambulance")
@CrossOrigin(origins = "*")
public class AmbulanceRequestController {

    @Autowired
    private AmbulanceRequestService ambulanceRequestService;

    @PostMapping("/request")
    public AmbulanceRequest requestAmbulance(@RequestBody AmbulanceRequest request) {
        return ambulanceRequestService.createRequest(request);
    }

   
}
