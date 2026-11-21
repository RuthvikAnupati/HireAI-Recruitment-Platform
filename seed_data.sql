-- =============================================================
-- HireAI - Demo Seed Data
-- Run: mysql -u root -p hack_quest_db < seed_data.sql
-- BCrypt hash below is for password: "password123"
-- =============================================================

-- ---------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------
INSERT IGNORE INTO users (id, email, password, role, full_name, created_at) VALUES
-- Recruiters
(1, 'recruiter@demo.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RECRUITER', 'Alice Recruiter', NOW()),
(2, 'recruiter2@demo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RECRUITER', 'Bob Hiring Manager', NOW()),

-- Candidates
(3, 'candidate@demo.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CANDIDATE', 'Charlie Dev', NOW()),
(4, 'candidate2@demo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CANDIDATE', 'Diana DataSci', NOW()),
(5, 'candidate3@demo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CANDIDATE', 'Evan Engineer', NOW());

-- ---------------------------------------------------------------
-- CANDIDATE PROFILES
-- ---------------------------------------------------------------
INSERT IGNORE INTO candidates (id, user_id, resume_text, skills, experience_years, education, phone, linkedin_url) VALUES
(1, 3,
 'Charlie Dev is a full-stack software engineer with 4 years of experience in Java, Spring Boot, React and MySQL. Led multiple microservices migration projects.',
 'Java, Spring Boot, React, MySQL, Docker, Kubernetes, REST APIs',
 4, 'B.Tech Computer Science, IIT Delhi', '+91-9000000001', 'https://linkedin.com/in/charliedev'),

(2, 4,
 'Diana DataSci holds a Masters in Data Science with 3 years of experience in Python, Machine Learning, TensorFlow and SQL. Published 2 papers on NLP.',
 'Python, Machine Learning, TensorFlow, Pandas, SQL, NLP, Scikit-learn',
 3, 'M.Tech Data Science, IISc Bangalore', '+91-9000000002', 'https://linkedin.com/in/dianadatasci'),

(3, 5,
 'Evan Engineer is a DevOps specialist with 5 years of experience in CI/CD pipelines, AWS, Terraform and Docker. Certified AWS Solutions Architect.',
 'AWS, Docker, Kubernetes, Terraform, Jenkins, CI/CD, Linux, Ansible',
 5, 'B.E. Information Technology, BITS Pilani', '+91-9000000003', 'https://linkedin.com/in/evanengineer');

-- ---------------------------------------------------------------
-- JOB POSTINGS
-- ---------------------------------------------------------------
INSERT IGNORE INTO jobs (id, title, description, requirements, skills_required, experience_required, location, job_type, status, recruiter_id, created_at) VALUES

(1, 'Senior Software Engineer',
 'We are looking for a Senior Software Engineer to join our core platform team. You will design, build, and maintain scalable backend services that power our recruitment platform. You will collaborate closely with product managers and frontend engineers.',
 'Strong knowledge of object-oriented design. Experience with microservices architecture. Ability to mentor junior developers. Excellent problem-solving skills.',
 'Java, Spring Boot, Microservices, MySQL, REST APIs, Docker',
 4, 'Bangalore, India (Hybrid)', 'FULL_TIME', 'ACTIVE', 1, NOW()),

(2, 'Data Scientist',
 'Join our AI & Analytics team to build ML models that drive intelligent candidate-job matching. You will work with large datasets, design experiments, and ship models to production.',
 'Solid understanding of supervised and unsupervised learning. Experience with feature engineering and model evaluation. Ability to communicate findings to non-technical stakeholders.',
 'Python, Machine Learning, TensorFlow, Scikit-learn, SQL, NLP, Pandas',
 2, 'Remote', 'FULL_TIME', 'ACTIVE', 1, NOW()),

(3, 'Product Manager - HR Tech',
 'We seek an experienced Product Manager who understands the talent acquisition space. You will own the product roadmap, gather requirements, and work cross-functionally to deliver features that delight recruiters and candidates.',
 'Experience in B2B SaaS product management. Strong analytical skills. Excellent stakeholder management. Prior exposure to HR-tech is a plus.',
 'Product Strategy, Roadmapping, Agile, SQL, User Research, Stakeholder Management',
 3, 'Mumbai, India', 'FULL_TIME', 'ACTIVE', 2, NOW()),

(4, 'DevOps Engineer',
 'We are growing our infrastructure team and need a DevOps Engineer to build and maintain our cloud-native deployment pipelines. You will own CI/CD, container orchestration, and cloud cost optimisation.',
 'Deep knowledge of AWS or GCP. Experience with Kubernetes in production. Infrastructure-as-Code using Terraform. Strong scripting skills.',
 'AWS, Docker, Kubernetes, Terraform, Jenkins, CI/CD, Linux, Python',
 3, 'Hyderabad, India (On-site)', 'FULL_TIME', 'ACTIVE', 2, NOW()),

(5, 'ML Engineer',
 'As an ML Engineer you will bridge the gap between data science and production. You will implement, optimise, and serve machine learning models at scale, ensuring reliability and low latency for our AI-powered features.',
 'Experience deploying ML models to production. Familiarity with model serving frameworks. Strong Python skills. Understanding of LLM APIs is a big plus.',
 'Python, TensorFlow, PyTorch, MLflow, FastAPI, Docker, Kubernetes, LLMs',
 2, 'Remote', 'FULL_TIME', 'ACTIVE', 1, NOW());

-- ---------------------------------------------------------------
-- SAMPLE APPLICATIONS
-- ---------------------------------------------------------------
INSERT IGNORE INTO applications (id, job_id, candidate_id, status, match_score, applied_at, notes) VALUES
(1, 1, 1, 'INTERVIEW',  87.50, NOW(), 'Strong Java background. Schedule technical interview.'),
(2, 2, 2, 'SCREENING',  91.00, NOW(), 'Excellent ML profile. Review NLP paper.'),
(3, 4, 3, 'APPLIED',    89.00, NOW(), NULL),
(4, 5, 2, 'APPLIED',    78.00, NOW(), NULL),
(5, 1, 3, 'SCREENING',  65.00, NOW(), 'DevOps background — partial match for SE role.');
