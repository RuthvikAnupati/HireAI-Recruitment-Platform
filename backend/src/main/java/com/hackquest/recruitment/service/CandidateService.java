package com.hackquest.recruitment.service;

import com.hackquest.recruitment.dto.CandidateDTO;
import com.hackquest.recruitment.model.Candidate;
import com.hackquest.recruitment.model.User;
import com.hackquest.recruitment.repository.CandidateRepository;
import com.hackquest.recruitment.repository.UserRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private UserRepository userRepository;

    private final String uploadDir = "uploads";

    public CandidateDTO getProfile(UserDetails currentUser) {
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Candidate candidate = candidateRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Candidate c = Candidate.builder().user(user).experienceYears(0).build();
                    return candidateRepository.save(c);
                });
        return toDTO(candidate);
    }

    public CandidateDTO updateProfile(CandidateDTO dto, UserDetails currentUser) {
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Candidate candidate = candidateRepository.findByUserId(user.getId())
                .orElseGet(() -> Candidate.builder().user(user).build());

        if (dto.getFullName() != null) {
            user.setFullName(dto.getFullName());
            userRepository.save(user);
        }

        candidate.setPhone(dto.getPhone());
        candidate.setEducation(dto.getEducation());
        if (dto.getExperienceYears() != null) {
            candidate.setExperienceYears(dto.getExperienceYears());
        }
        candidate.setSkills(dto.getSkills());
        candidate.setLinkedinUrl(dto.getLinkedinUrl());

        return toDTO(candidateRepository.save(candidate));
    }

    public CandidateDTO uploadResume(MultipartFile file, UserDetails currentUser) throws IOException {
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Candidate candidate = candidateRepository.findByUserId(user.getId())
                .orElseGet(() -> Candidate.builder().user(user).build());

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;
        Path targetLocation = Paths.get(uploadDir).resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        String extractedText = "";
        if (extension.equalsIgnoreCase(".pdf")) {
            try (PDDocument document = Loader.loadPDF(targetLocation.toFile())) {
                PDFTextStripper stripper = new PDFTextStripper();
                extractedText = stripper.getText(document);
            } catch (Exception e) {
                extractedText = "PDF parsed (text extraction partial): " + e.getMessage();
            }
        } else {
            extractedText = new String(file.getBytes(), StandardCharsets.UTF_8);
        }

        candidate.setResumePath(targetLocation.toString());
        candidate.setResumeText(extractedText);

        return toDTO(candidateRepository.save(candidate));
    }

    public CandidateDTO getCandidateById(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + id));
        return toDTO(candidate);
    }

    public java.util.List<CandidateDTO> getAllCandidates() {
        return candidateRepository.findAll().stream()
                .map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    private CandidateDTO toDTO(Candidate candidate) {
        User user = candidate.getUser();
        return CandidateDTO.builder()
                .id(candidate.getId())
                .userId(user != null ? user.getId() : null)
                .email(user != null ? user.getEmail() : null)
                .fullName(user != null ? user.getFullName() : null)
                .resumePath(candidate.getResumePath())
                .resumeText(candidate.getResumeText())
                .skills(candidate.getSkills())
                .experienceYears(candidate.getExperienceYears())
                .education(candidate.getEducation())
                .phone(candidate.getPhone())
                .linkedinUrl(candidate.getLinkedinUrl())
                .build();
    }
}
