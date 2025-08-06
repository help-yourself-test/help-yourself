import React from "react";
import {
  Target,
  CheckCircle,
  AlertCircle,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import SkillMatchingService from "../../services/skillMatching";
import "./SkillMatchScore.css";

const SkillMatchScore = ({
  jobSeekerSkills,
  jobRequiredSkills,
  showDetails = true,
}) => {
  if (!jobSeekerSkills || !jobRequiredSkills) {
    return null;
  }

  const matchResult = SkillMatchingService.calculateSkillMatch(
    jobSeekerSkills,
    jobRequiredSkills
  );
  const matchLevel = SkillMatchingService.getMatchLevel(matchResult.percentage);
  const recommendations = SkillMatchingService.generateSkillRecommendations(
    matchResult.missingSkills
  );

  return (
    <div className="skill-match-score">
      <div className="skill-match-header">
        <div className="skill-match-icon">
          <Target size={20} />
        </div>
        <div className="skill-match-info">
          <h3>Skill Match Score</h3>
          <div className="skill-match-percentage">
            <span
              className="percentage-number"
              style={{ color: matchLevel.color }}
            >
              {matchResult.percentage}%
            </span>
            <span className="match-level" style={{ color: matchLevel.color }}>
              {matchLevel.icon} {matchLevel.level}
            </span>
          </div>
        </div>
      </div>

      <div className="skill-match-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${matchResult.percentage}%`,
              backgroundColor: matchLevel.color,
            }}
          ></div>
        </div>
        <div className="match-description">{matchLevel.description}</div>
      </div>

      {showDetails && (
        <div className="skill-match-details">
          <div className="skills-breakdown">
            <div className="matched-skills">
              <div className="skill-section-header">
                <CheckCircle size={16} className="icon-matched" />
                <span>Matched Skills ({matchResult.totalMatched})</span>
              </div>
              <div className="skills-list">
                {matchResult.matchedSkills.length > 0 ? (
                  matchResult.matchedSkills.map((skill, index) => (
                    <span key={index} className="skill-tag matched">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="no-skills">No matching skills found</span>
                )}
              </div>
            </div>

            {matchResult.missingSkills.length > 0 && (
              <div className="missing-skills">
                <div className="skill-section-header">
                  <AlertCircle size={16} className="icon-missing" />
                  <span>
                    Missing Skills ({matchResult.missingSkills.length})
                  </span>
                </div>
                <div className="skills-list">
                  {matchResult.missingSkills.map((skill, index) => (
                    <span key={index} className="skill-tag missing">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {recommendations.length > 0 && (
            <div className="skill-recommendations">
              <div className="recommendations-header">
                <BookOpen size={16} />
                <span>Recommended Learning</span>
              </div>
              <div className="recommendations-list">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <div className="recommendation-skill">
                      <span className="skill-name">{rec.skill}</span>
                      <span
                        className={`priority-badge ${rec.priority.toLowerCase()}`}
                      >
                        {rec.priority} Priority
                      </span>
                    </div>
                    <div className="learning-platforms">
                      {rec.platforms.slice(0, 2).map((platform, idx) => (
                        <span key={idx} className="platform-tag">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="skill-match-stats">
            <div className="stat-item">
              <TrendingUp size={16} />
              <span>
                {matchResult.totalMatched} of {matchResult.totalRequired} skills
                matched
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillMatchScore;
