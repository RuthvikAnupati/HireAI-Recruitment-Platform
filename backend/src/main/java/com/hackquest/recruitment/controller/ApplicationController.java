package com.hackquest.recruitment.controller;

import com.hackquest.recruitment.dto.ApplicationDTO;
import com.hackquest.recruitment.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<?> apply(@RequestBody Map<String, Object> body, @AuthenticationPrincipal UserDetails currentUser) {
        try {
            Long jobId = Long.valueOf(body.get("jobId").toString());
            return ResponseEntity.ok(applicationService.apply(jobId, currentUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyApplications(@AuthenticationPrincipal UserDetails currentUser) {
        try {
            return ResponseEntity.ok(applicationService.getMyApplications(currentUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationDTO>> getApplicationsForJob(@PathVariable Long jobId, @AuthenticationPrincipal UserDetails currentUser) {
        return ResponseEntity.ok(applicationService.getApplicationsForJob(jobId, currentUser));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, @AuthenticationPrincipal UserDetails currentUser) {
        try {
            String status = body.get("status");
            return ResponseEntity.ok(applicationService.updateStatus(id, status, currentUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
