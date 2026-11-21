package com.hackquest.recruitment.controller;

import com.hackquest.recruitment.dto.AIRequest;
import com.hackquest.recruitment.dto.AIResponse;
import com.hackquest.recruitment.model.Candidate;
import com.hackquest.recruitment.model.ResumeAnalysis;
import com.hackquest.recruitment.model.User;
import com.hackquest.recruitment.repository.CandidateRepository;
import com.hackquest.recruitment.repository.UserRepository;
import com.hackquest.recruitment.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired
    private AIService aiService;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private UserRepository userRepository;

    private Long resolveCandidateId(Long candidateId, UserDetails currentUser) {
        if (candidateId != null) {
            if (candidateRepository.existsById(candidateId)) {
                return candidateId;
            }
            java.util.Optional<Candidate> byUserId = candidateRepository.findByUserId(candidateId);
            if (byUserId.isPresent()) {
                return byUserId.get().getId();
            }
        }
        if (currentUser != null) {
            User user = userRepository.findByEmail(currentUser.getUsername()).orElse(null);
            if (user != null) {
                Candidate candidate = candidateRepository.findByUserId(user.getId()).orElse(null);
                if (candidate != null) return candidate.getId();
            }
        }
        throw new RuntimeException("Candidate not specified or profile not found");
    }

    @PostMapping("/analyze-resume")
    public ResponseEntity<?> analyzeResume(@RequestBody(required = false) AIRequest request, @AuthenticationPrincipal UserDetails currentUser) {
        try {
            Long candidateId = resolveCandidateId(request != null ? request.getCandidateId() : null, currentUser);
            AIResponse response = aiService.analyzeResume(candidateId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/match-job")
    public ResponseEntity<?> matchJob(@RequestBody AIRequest request, @AuthenticationPrincipal UserDetails currentUser) {
        try {
            Long candidateId = resolveCandidateId(request.getCandidateId(), currentUser);
            if (request.getJobId() == null) {
                throw new RuntimeException("Job ID is required for job matching");
            }
            AIResponse response = aiService.matchJobToCandidate(candidateId, request.getJobId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/interview-questions")
    public ResponseEntity<?> interviewQuestions(@RequestBody AIRequest request, @AuthenticationPrincipal UserDetails currentUser) {
        try {
            if (request.getJobId() == null) {
                throw new RuntimeException("Job ID is required for interview questions");
            }
            Long candidateId = null;
            try {
                candidateId = resolveCandidateId(request.getCandidateId(), currentUser);
            } catch (Exception ignored) {}

            AIResponse response = aiService.generateInterviewQuestions(request.getJobId(), candidateId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/improve-resume")
    public ResponseEntity<?> improveResume(@RequestBody AIRequest request, @AuthenticationPrincipal UserDetails currentUser) {
        try {
            Long candidateId = resolveCandidateId(request.getCandidateId(), currentUser);
            AIResponse response = aiService.improveResume(candidateId, request.getJobId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/analysis/{candidateId}")
    public ResponseEntity<?> getAnalysis(@PathVariable Long candidateId) {
        try {
            ResumeAnalysis analysis = aiService.getLatestAnalysis(candidateId);
            if (analysis == null) {
                return ResponseEntity.ok(Map.of("message", "No analysis found for candidate"));
            }
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
