package com.hackquest.recruitment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDTO {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private String resumePath;
    private String resumeText;
    private String skills;
    private Integer experienceYears;
    private String education;
    private String phone;
    private String linkedinUrl;
}
