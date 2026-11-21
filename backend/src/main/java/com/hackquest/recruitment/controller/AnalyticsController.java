package com.hackquest.recruitment.controller;

import com.hackquest.recruitment.repository.ApplicationRepository;
import com.hackquest.recruitment.repository.CandidateRepository;
import com.hackquest.recruitment.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.findByStatus("ACTIVE").size();
        long totalApplications = applicationRepository.count();
        long totalCandidates = candidateRepository.count();

        return ResponseEntity.ok(Map.of(
                "totalJobs", totalJobs,
                "activeJobs", activeJobs,
                "totalApplications", totalApplications,
                "totalCandidates", totalCandidates
        ));
    }
}
