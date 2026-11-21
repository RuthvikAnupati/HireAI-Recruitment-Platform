CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS candidates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL,
  resume_path VARCHAR(500),
  resume_text LONGTEXT,
  skills TEXT,
  experience_years INT DEFAULT 0,
  education VARCHAR(500),
  phone VARCHAR(20),
  linkedin_url VARCHAR(500),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NOT NULL,
  requirements TEXT,
  skills_required TEXT,
  experience_required INT DEFAULT 0,
  location VARCHAR(255),
  job_type VARCHAR(20) DEFAULT 'FULL_TIME',
  status VARCHAR(20) DEFAULT 'ACTIVE',
  recruiter_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recruiter_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS applications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT NOT NULL,
  candidate_id BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'APPLIED',
  match_score DECIMAL(5,2),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);
CREATE TABLE IF NOT EXISTS resume_analysis (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  candidate_id BIGINT NOT NULL,
  analysis_text LONGTEXT,
  skills_extracted TEXT,
  improvement_suggestions LONGTEXT,
  overall_score DECIMAL(5,2),
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);
