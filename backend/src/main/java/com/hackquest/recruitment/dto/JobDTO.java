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
public class JobDTO {
    private Long id;
    private String title;
    private String description;
    private String requirements;
    private String skillsRequired;
    private Integer experienceRequired;
    private String location;
    private String jobType;
    private String status;
    private Long recruiterId;
    private String recruiterName;
    private LocalDateTime createdAt;
    private Long applicationCount;
}
