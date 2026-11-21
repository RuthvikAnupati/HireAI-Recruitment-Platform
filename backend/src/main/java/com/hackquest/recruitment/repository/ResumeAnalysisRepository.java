package com.hackquest.recruitment.repository;

import com.hackquest.recruitment.model.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {
    List<ResumeAnalysis> findByCandidateIdOrderByAnalyzedAtDesc(Long candidateId);
    Optional<ResumeAnalysis> findTopByCandidateIdOrderByAnalyzedAtDesc(Long candidateId);
}
