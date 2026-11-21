package com.hackquest.recruitment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDTO {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String jobLocation;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidateSkills;
    private String status;
    private Double matchScore;
    private LocalDateTime appliedAt;
    private String notes;
}
