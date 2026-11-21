package com.hackquest.recruitment.service;

import com.hackquest.recruitment.dto.AIResponse;
import com.hackquest.recruitment.dto.ApplicationDTO;
import com.hackquest.recruitment.model.Application;
import com.hackquest.recruitment.model.Candidate;
import com.hackquest.recruitment.model.Job;
import com.hackquest.recruitment.model.User;
import com.hackquest.recruitment.repository.ApplicationRepository;
import com.hackquest.recruitment.repository.CandidateRepository;
import com.hackquest.recruitment.repository.JobRepository;
import com.hackquest.recruitment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIService aiService;

    public ApplicationDTO apply(Long jobId, UserDetails currentUser) {
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Candidate candidate = candidateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        applicationRepository.findByJobIdAndCandidateId(jobId, candidate.getId())
                .ifPresent(existing -> {
                    throw new RuntimeException("You have already applied for this job");
                });

        Double matchScore = 75.0;
        try {
            AIResponse matchResponse = aiService.matchJobToCandidate(candidate.getId(), jobId);
            if (matchResponse != null && matchResponse.getScore() != null) {
                matchScore = matchResponse.getScore();
            }
        } catch (Exception e) {
            System.err.println("Could not auto-generate match score on apply: " + e.getMessage());
        }

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .status("APPLIED")
                .matchScore(matchScore)
                .build();

        return toDTO(applicationRepository.save(application));
    }

    public List<ApplicationDTO> getMyApplications(UserDetails currentUser) {
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Candidate candidate = candidateRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Candidate profile not found"));

        return applicationRepository.findByCandidateId(candidate.getId()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ApplicationDTO> getApplicationsForJob(Long jobId, UserDetails currentUser) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ApplicationDTO updateStatus(Long id, String status, UserDetails currentUser) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        application.setStatus(status);
        return toDTO(applicationRepository.save(application));
    }

    private ApplicationDTO toDTO(Application app) {
        Candidate c = app.getCandidate();
        User u = c != null ? c.getUser() : null;
        Job j = app.getJob();

        return ApplicationDTO.builder()
                .id(app.getId())
                .jobId(j != null ? j.getId() : null)
                .jobTitle(j != null ? j.getTitle() : null)
                .jobLocation(j != null ? j.getLocation() : null)
                .candidateId(c != null ? c.getId() : null)
                .candidateName(u != null ? u.getFullName() : null)
                .candidateEmail(u != null ? u.getEmail() : null)
                .candidateSkills(c != null ? c.getSkills() : null)
                .status(app.getStatus())
                .matchScore(app.getMatchScore())
                .appliedAt(app.getAppliedAt())
                .notes(app.getNotes())
                .build();
    }
}
