package com.hackquest.recruitment.repository;

import com.hackquest.recruitment.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByJobId(Long jobId);
    List<Application> findByStatus(String status);
    Optional<Application> findByJobIdAndCandidateId(Long jobId, Long candidateId);
    long countByJobId(Long jobId);
    long countByCandidateId(Long candidateId);
}
