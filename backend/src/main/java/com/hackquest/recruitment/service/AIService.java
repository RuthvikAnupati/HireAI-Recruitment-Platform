package com.hackquest.recruitment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackquest.recruitment.dto.AIResponse;
import com.hackquest.recruitment.model.Candidate;
import com.hackquest.recruitment.model.Job;
import com.hackquest.recruitment.model.ResumeAnalysis;
import com.hackquest.recruitment.model.User;
import com.hackquest.recruitment.repository.CandidateRepository;
import com.hackquest.recruitment.repository.JobRepository;
import com.hackquest.recruitment.repository.ResumeAnalysisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AIService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String geminiApiUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ResumeAnalysisRepository resumeAnalysisRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isGeminiConfigured() {
        return geminiApiKey != null && !geminiApiKey.trim().isEmpty() && !geminiApiKey.equalsIgnoreCase("REPLACE_WITH_YOUR_KEY");
    }

    public String callGemini(String prompt) {
        if (!isGeminiConfigured()) {
            return null;
        }

        try {
            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> part = Map.of("parts", List.of(textPart));
            Map<String, Object> body = Map.of("contents", List.of(part));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            String url = geminiApiUrl + "?key=" + geminiApiKey;
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode textNode = root.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
        } catch (Exception e) {
            System.err.println("Gemini API call failed: " + e.getMessage());
        }

        return null;
    }

    public AIResponse analyzeResume(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        String resumeContent = candidate.getResumeText();
        if (resumeContent == null || resumeContent.trim().isEmpty()) {
            resumeContent = "Skills: " + (candidate.getSkills() != null ? candidate.getSkills() : "N/A") +
                    "\nEducation: " + (candidate.getEducation() != null ? candidate.getEducation() : "N/A") +
                    "\nExperience: " + (candidate.getExperienceYears() != null ? candidate.getExperienceYears() : 0) + " years";
        }

        double calculatedScore = computeResumeScore(candidate);

        String prompt = "You are an expert AI Technical Recruiter. Analyze this candidate resume:\n\n" + resumeContent +
                "\n\nProvide an evaluation with:\n1. Overall Score (0-100)\n2. Key Skills Extracted\n3. Strengths\n4. Weaknesses/Gaps\n5. Actionable Improvement Suggestions." +
                "\nEnsure the score is written as '**Overall Score: X/100**'.";

        String aiResult = callGemini(prompt);
        Double finalScore;
        if (aiResult != null && !aiResult.trim().isEmpty()) {
            finalScore = extractScore(aiResult, calculatedScore);
        } else {
            aiResult = buildDynamicResumeAnalysis(candidate, calculatedScore);
            finalScore = calculatedScore;
        }

        ResumeAnalysis analysis = ResumeAnalysis.builder()
                .candidate(candidate)
                .analysisText(aiResult)
                .skillsExtracted(candidate.getSkills() != null ? candidate.getSkills() : "Extracted from resume")
                .improvementSuggestions("Optimize ATS formatting, highlight measurable outcomes, align with target job keywords.")
                .overallScore(finalScore)
                .build();
        resumeAnalysisRepository.save(analysis);

        return AIResponse.builder()
                .type("RESUME_ANALYSIS")
                .score(finalScore)
                .result(aiResult)
                .build();
    }

    public AIResponse matchJobToCandidate(Long candidateId, Long jobId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        double dynamicScore = computeDynamicMatchScore(candidate, job);

        String candidateInfo = "Candidate Skills: " + (candidate.getSkills() != null ? candidate.getSkills() : "None listed") +
                "\nExperience: " + (candidate.getExperienceYears() != null ? candidate.getExperienceYears() : 0) + " years" +
                "\nResume Summary: " + (candidate.getResumeText() != null ? candidate.getResumeText() : "Not provided");

        String jobInfo = "Job Title: " + job.getTitle() +
                "\nDescription: " + (job.getDescription() != null ? job.getDescription() : "") +
                "\nRequired Skills: " + (job.getSkillsRequired() != null ? job.getSkillsRequired() : "") +
                "\nExperience Required: " + (job.getExperienceRequired() != null ? job.getExperienceRequired() : 0) + " years";

        String prompt = "You are an AI Talent Matching Engine. Compare this candidate with the job posting:\n\n" +
                "[CANDIDATE PROFILE]\n" + candidateInfo + "\n\n" +
                "[JOB DETAILS]\n" + jobInfo + "\n\n" +
                "Evaluate compatibility strictly based on skill overlap and experience fit. " +
                "State Match Score in this exact format: **Match Score: X%** (a realistic percentage between 0% and 100%), " +
                "followed by Match Reasoning, Matching Skills, Missing Skills, and Recommendation.";

        String aiResult = callGemini(prompt);
        Double finalScore;
        if (aiResult != null && !aiResult.trim().isEmpty()) {
            finalScore = extractScore(aiResult, dynamicScore);
        } else {
            aiResult = buildDynamicJobMatchResult(candidate, job, dynamicScore);
            finalScore = dynamicScore;
        }

        return AIResponse.builder()
                .type("JOB_MATCH")
                .score(finalScore)
                .result(aiResult)
                .build();
    }

    public AIResponse generateInterviewQuestions(Long jobId, Long candidateId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        String candidateSkills = "General Full Stack Engineering";
        if (candidateId != null) {
            Candidate c = candidateRepository.findById(candidateId).orElse(null);
            if (c != null && c.getSkills() != null) {
                candidateSkills = c.getSkills();
            }
        }

        String prompt = "You are a Senior Technical Hiring Manager. Generate 10 targeted interview questions for:\n\n" +
                "Job Title: " + job.getTitle() + "\n" +
                "Requirements: " + job.getRequirements() + "\n" +
                "Required Skills: " + job.getSkillsRequired() + "\n" +
                "Candidate Background: " + candidateSkills + "\n\n" +
                "Include:\n- 3 Core Technical Architecture Questions\n- 3 Hands-on Problem Solving Questions\n- 2 Behavioral/Leadership Questions\n- 2 Scenario-based System Design Questions.";

        String aiResult = callGemini(prompt);
        if (aiResult == null || aiResult.trim().isEmpty()) {
            aiResult = buildDynamicInterviewQuestions(job, candidateSkills);
        }

        return AIResponse.builder()
                .type("INTERVIEW_QUESTIONS")
                .score(null)
                .result(aiResult)
                .build();
    }

    public AIResponse improveResume(Long candidateId, Long jobId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        Job job = null;
        if (jobId != null) {
            job = jobRepository.findById(jobId).orElse(null);
        }

        String targetJobDesc = job != null 
                ? "Title: " + job.getTitle() + "\nRequirements: " + job.getRequirements() + "\nSkills: " + job.getSkillsRequired()
                : "Modern Software Development & Technology Roles";

        String resumeText = candidate.getResumeText() != null && !candidate.getResumeText().trim().isEmpty() 
                ? candidate.getResumeText() 
                : ("Skills: " + candidate.getSkills() + "\nExperience: " + candidate.getExperienceYears() + " years");

        String prompt = "You are an Elite Executive Resume Strategist. Review this resume against the target role:\n\n" +
                "[RESUME]\n" + resumeText + "\n\n" +
                "[TARGET ROLE]\n" + targetJobDesc + "\n\n" +
                "Provide detailed, actionable resume improvement advice:\n" +
                "1. ATS Keyword Optimization\n" +
                "2. Action Verbs & Metric-driven Bullet Rewrites\n" +
                "3. Section Reorganization & Highlighting\n" +
                "4. Missing Certifications or Modern Tools to mention.";

        String aiResult = callGemini(prompt);
        if (aiResult == null || aiResult.trim().isEmpty()) {
            aiResult = buildDynamicResumeImprovement(candidate, job);
        }

        return AIResponse.builder()
                .type("RESUME_IMPROVEMENT")
                .score(null)
                .result(aiResult)
                .build();
    }

    public ResumeAnalysis getLatestAnalysis(Long candidateId) {
        return resumeAnalysisRepository.findTopByCandidateIdOrderByAnalyzedAtDesc(candidateId)
                .orElse(null);
    }

    // -------------------------------------------------------------
    // Intelligent Scoring & Fallback Generation Algorithms
    // -------------------------------------------------------------

    public double computeDynamicMatchScore(Candidate candidate, Job job) {
        Set<String> requiredSkills = parseSkills(job.getSkillsRequired());
        if (requiredSkills.isEmpty() && job.getDescription() != null) {
            requiredSkills = extractKeywords(job.getDescription());
        }

        String candidateText = (candidate.getSkills() != null ? candidate.getSkills() : "") + " " +
                (candidate.getResumeText() != null ? candidate.getResumeText() : "");
        Set<String> candidateSkills = parseSkills(candidateText);

        if (requiredSkills.isEmpty()) {
            return 75.0;
        }

        int matches = 0;
        for (String req : requiredSkills) {
            for (String cand : candidateSkills) {
                if (cand.contains(req) || req.contains(cand)) {
                    matches++;
                    break;
                }
            }
        }

        double skillRatio = (double) matches / (double) requiredSkills.size();

        int candExp = candidate.getExperienceYears() != null ? candidate.getExperienceYears() : 0;
        int reqExp = job.getExperienceRequired() != null ? job.getExperienceRequired() : 0;
        double expRatio = 1.0;
        if (reqExp > 0) {
            expRatio = Math.min((double) candExp / (double) reqExp, 1.25);
        }

        double totalScore = (skillRatio * 65.0) + (Math.min(expRatio, 1.0) * 30.0);
        if (candExp > reqExp && reqExp > 0) {
            totalScore += 5.0; // Seniority bonus
        }

        // Clamp between 15% and 98%
        totalScore = Math.max(15.0, Math.min(98.0, totalScore));
        return Math.round(totalScore * 10.0) / 10.0;
    }

    public double computeResumeScore(Candidate candidate) {
        double score = 55.0;

        int exp = candidate.getExperienceYears() != null ? candidate.getExperienceYears() : 0;
        score += Math.min(exp * 5.0, 20.0); // up to 20 pts for experience

        Set<String> skills = parseSkills(candidate.getSkills());
        score += Math.min(skills.size() * 3.0, 15.0); // up to 15 pts for skills

        if (candidate.getResumeText() != null && candidate.getResumeText().length() > 200) {
            score += 7.0; // detailed resume text bonus
        }
        if (candidate.getEducation() != null && !candidate.getEducation().trim().isEmpty()) {
            score += 3.0; // education listed
        }

        return Math.min(96.0, Math.max(45.0, score));
    }

    private String buildDynamicJobMatchResult(Candidate candidate, Job job, double score) {
        Set<String> requiredSkills = parseSkills(job.getSkillsRequired());
        String candidateText = (candidate.getSkills() != null ? candidate.getSkills() : "") + " " +
                (candidate.getResumeText() != null ? candidate.getResumeText() : "");
        Set<String> candidateSkills = parseSkills(candidateText);

        List<String> matching = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : requiredSkills) {
            boolean matched = false;
            for (String cand : candidateSkills) {
                if (cand.contains(req) || req.contains(cand)) {
                    matched = true;
                    matching.add(req);
                    break;
                }
            }
            if (!matched) {
                missing.add(req);
            }
        }

        User user = candidate.getUser();
        String candidateName = (user != null && user.getFullName() != null) ? user.getFullName() : "Candidate";
        int candExp = candidate.getExperienceYears() != null ? candidate.getExperienceYears() : 0;
        int reqExp = job.getExperienceRequired() != null ? job.getExperienceRequired() : 0;

        String verdict;
        if (score >= 80) {
            verdict = "**Strong Match!** Candidate demonstrates excellent stack alignment and should proceed directly to the technical interview.";
        } else if (score >= 60) {
            verdict = "**Moderate Match.** Candidate has foundational skills but may require onboarding or screening on key missing technologies.";
        } else {
            verdict = "**Low Match.** Significant skill and experience gaps identified for this specific role.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("### AI Semantic Job Matching Evaluation\n\n");
        sb.append("**Match Score: ").append((int) score).append("%**\n\n");
        sb.append("**Candidate:** ").append(candidateName).append(" | **Target Role:** ").append(job.getTitle()).append("\n\n");
        sb.append("#### Match Reasoning\n").append(verdict).append("\n\n");

        sb.append("#### Matching Skills (").append(matching.size()).append(")\n");
        if (matching.isEmpty()) {
            sb.append("- No direct skill overlap identified from profile.\n");
        } else {
            for (String m : matching) {
                sb.append("- ").append(capitalize(m)).append(" ✓\n");
            }
        }
        sb.append("\n");

        sb.append("#### Missing or Recommended Skills (").append(missing.size()).append(")\n");
        if (missing.isEmpty()) {
            sb.append("- All core required technologies are covered!\n");
        } else {
            for (String mis : missing) {
                sb.append("- ").append(capitalize(mis)).append("\n");
            }
        }
        sb.append("\n");

        sb.append("#### Experience Comparison\n");
        sb.append("- **Candidate Experience:** ").append(candExp).append(" year(s)\n");
        sb.append("- **Role Requirement:** ").append(reqExp).append(" year(s)\n");
        if (candExp >= reqExp) {
            sb.append("- **Status:** Satisfies required experience tenure.\n");
        } else {
            sb.append("- **Status:** Candidate is ").append(reqExp - candExp).append(" year(s) below preferred seniority.\n");
        }

        return sb.toString();
    }

    private String buildDynamicResumeAnalysis(Candidate candidate, double score) {
        User user = candidate.getUser();
        String name = (user != null && user.getFullName() != null) ? user.getFullName() : "Candidate";
        String skills = candidate.getSkills() != null ? candidate.getSkills() : "Technical Skills";
        int exp = candidate.getExperienceYears() != null ? candidate.getExperienceYears() : 0;

        StringBuilder sb = new StringBuilder();
        sb.append("### AI Resume Analysis Report\n\n");
        sb.append("**Overall Score: ").append((int) score).append("/100**\n\n");
        sb.append("**Candidate:** ").append(name).append(" (").append(exp).append(" years experience)\n\n");

        sb.append("#### Key Skills Extracted:\n");
        for (String s : parseSkills(skills)) {
            sb.append("- ").append(capitalize(s)).append("\n");
        }
        sb.append("\n");

        sb.append("#### Strengths:\n");
        sb.append("- Solid portfolio with ").append(exp).append(" year(s) of practical industry/academic background.\n");
        sb.append("- Clear competencies across modern software technologies: ").append(skills).append(".\n");
        if (candidate.getEducation() != null) {
            sb.append("- Formal education credentials: ").append(candidate.getEducation()).append(".\n");
        }
        sb.append("\n");

        sb.append("#### Weaknesses & Gaps:\n");
        sb.append("- Quantifiable impact metrics (e.g. '% latency improvement', 'scale handled') could be emphasized more.\n");
        sb.append("- Consider showcasing cloud deployment and CI/CD automation certifications.\n\n");

        sb.append("#### Actionable Improvement Suggestions:\n");
        sb.append("1. **ATS Optimization:** Align your resume header and bullet points with standard job title keywords.\n");
        sb.append("2. **Action Verbs:** Use STAR method (Situation, Task, Action, Result) for all work experience bullets.\n");
        sb.append("3. **Project Highlights:** Add GitHub repository links demonstrating clean architecture and testing.\n");

        return sb.toString();
    }

    private String buildDynamicInterviewQuestions(Job job, String candidateSkills) {
        return "### 10 AI-Generated Targeted Interview Questions\n\n" +
                "**Target Role:** " + job.getTitle() + " | **Focus Areas:** " + job.getSkillsRequired() + "\n\n" +
                "**1. Core Technical Architecture:**\n" +
                "- How do you structure a scalable, maintainable application using " + job.getSkillsRequired() + "?\n" +
                "- Describe how you optimize database schema and query performance under high concurrency.\n" +
                "- Explain your strategy for secure API design, token validation, and rate limiting.\n\n" +
                "**2. Hands-on Problem Solving:**\n" +
                "- Walk through a complex production bug you diagnosed in a distributed environment.\n" +
                "- How would you implement robust error handling and transactional rollbacks in critical services?\n" +
                "- Given candidate background in " + candidateSkills + ", how would you tackle a sudden surge in traffic?\n\n" +
                "**3. System Design & Scenario Questions:**\n" +
                "- Design a real-time notification or event processing pipeline for " + job.getTitle() + " workflows.\n" +
                "- How do you handle database migrations with zero downtime?\n\n" +
                "**4. Behavioral & Collaborative:**\n" +
                "- Tell us about a time you resolved technical disagreements regarding architecture or tooling.\n" +
                "- How do you ensure high test coverage and enforce code quality standards within a team?";
    }

    private String buildDynamicResumeImprovement(Candidate candidate, Job job) {
        String jobTitle = job != null ? job.getTitle() : "Target Tech Role";
        String reqSkills = job != null && job.getSkillsRequired() != null ? job.getSkillsRequired() : "Enterprise Tools & Frameworks";

        return "### AI Tailored Resume Improvement Recommendations\n\n" +
                "**Target Role:** " + jobTitle + "\n\n" +
                "**1. ATS Keyword Optimization:**\n" +
                "- Prominently feature high-frequency target keywords: **" + reqSkills + "** in your skills summary and experience bullets.\n" +
                "- Ensure standard section headings (Experience, Education, Technical Skills) for automated parsing.\n\n" +
                "**2. Impact-Driven Bullet Rewrites:**\n" +
                "- Instead of: *'Developed backend endpoints'*, write: *'Architected high-throughput REST APIs handling 5,000+ daily requests with 99.9% uptime.'*\n" +
                "- Instead of: *'Collaborated on database design'*, write: *'Optimized SQL query performance across core relational tables, reducing query latency by 40%.'*\n\n" +
                "**3. Modern Stack & Tooling:**\n" +
                "- Add specific references to containerization (Docker), automated CI/CD pipelines, and cloud environments.\n" +
                "- Include active links to live applications or GitHub repositories demonstrating test-driven development.";
    }

    private Set<String> parseSkills(String text) {
        if (text == null || text.trim().isEmpty()) return Collections.emptySet();
        return Arrays.stream(text.split("[,;/|\n]+"))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    private Set<String> extractKeywords(String text) {
        if (text == null || text.trim().isEmpty()) return Collections.emptySet();
        Set<String> keywords = new HashSet<>();
        String[] tokens = text.toLowerCase().split("[^a-zA-Z0-9+#]+");
        for (String t : tokens) {
            if (t.length() >= 3 && !List.of("and", "the", "for", "with", "this", "that", "you", "are").contains(t)) {
                keywords.add(t);
            }
        }
        return keywords;
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    private Double extractScore(String text, Double defaultScore) {
        try {
            Pattern p = Pattern.compile("(?:Match\\s*Score|Overall\\s*Score|Score|Rating)[:\\s]*(\\d{1,3})(?:%|/100)?", Pattern.CASE_INSENSITIVE);
            Matcher m = p.matcher(text);
            if (m.find()) {
                double val = Double.parseDouble(m.group(1));
                if (val >= 0 && val <= 100) return val;
            }
        } catch (Exception ignored) {}
        return defaultScore;
    }
}
