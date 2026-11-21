package com.hackquest.recruitment.service;

import com.hackquest.recruitment.dto.JobDTO;
import com.hackquest.recruitment.model.Job;
import com.hackquest.recruitment.model.User;
import com.hackquest.recruitment.repository.ApplicationRepository;
import com.hackquest.recruitment.repository.JobRepository;
import com.hackquest.recruitment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public List<JobDTO> getAllActiveJobs() {
        return jobRepository.findByStatus("ACTIVE").stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public JobDTO getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        return toDTO(job);
    }

    public JobDTO createJob(JobDTO dto, UserDetails currentUser) {
        User recruiter = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Job job = Job.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .requirements(dto.getRequirements())
                .skillsRequired(dto.getSkillsRequired())
                .experienceRequired(dto.getExperienceRequired() != null ? dto.getExperienceRequired() : 0)
                .location(dto.getLocation())
                .jobType(dto.getJobType() != null ? dto.getJobType() : "FULL_TIME")
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .recruiter(recruiter)
                .build();

        return toDTO(jobRepository.save(job));
    }

    public JobDTO updateJob(Long id, JobDTO dto, UserDetails currentUser) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));

        User recruiter = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Not authorized to update this job");
        }

        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setRequirements(dto.getRequirements());
        job.setSkillsRequired(dto.getSkillsRequired());
        if (dto.getExperienceRequired() != null) job.setExperienceRequired(dto.getExperienceRequired());
        job.setLocation(dto.getLocation());
        if (dto.getJobType() != null) job.setJobType(dto.getJobType());
        if (dto.getStatus() != null) job.setStatus(dto.getStatus());

        return toDTO(jobRepository.save(job));
    }

    public void deleteJob(Long id, UserDetails currentUser) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));

        User recruiter = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Not authorized to delete this job");
        }

        jobRepository.delete(job);
    }

    public List<JobDTO> getJobsByRecruiter(UserDetails currentUser) {
        User recruiter = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return jobRepository.findByRecruiterId(recruiter.getId()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private JobDTO toDTO(Job job) {
        long appCount = applicationRepository.countByJobId(job.getId());
        return JobDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .skillsRequired(job.getSkillsRequired())
                .experienceRequired(job.getExperienceRequired())
                .location(job.getLocation())
                .jobType(job.getJobType())
                .status(job.getStatus())
                .recruiterId(job.getRecruiter() != null ? job.getRecruiter().getId() : null)
                .recruiterName(job.getRecruiter() != null ? job.getRecruiter().getFullName() : null)
                .createdAt(job.getCreatedAt())
                .applicationCount(appCount)
                .build();
    }
}
