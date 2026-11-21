package com.hackquest.recruitment.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String resumePath;

    @Column(columnDefinition = "LONGTEXT")
    private String resumeText;

    @Column(columnDefinition = "TEXT")
    private String skills;

    private Integer experienceYears = 0;

    private String education;

    private String phone;

    private String linkedinUrl;
}
