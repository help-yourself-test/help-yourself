// Skill matching utility for job seekers
export class SkillMatchingService {
  /**
   * Calculate skill match percentage between job seeker skills and job requirements
   * @param {Array} jobSeekerSkills - Array of job seeker's skills
   * @param {Array} jobRequiredSkills - Array of required skills for the job
   * @returns {Object} - Match result with percentage and details
   */
  static calculateSkillMatch(jobSeekerSkills, jobRequiredSkills) {
    if (
      !jobSeekerSkills ||
      !jobRequiredSkills ||
      jobSeekerSkills.length === 0 ||
      jobRequiredSkills.length === 0
    ) {
      return {
        percentage: 0,
        matchedSkills: [],
        missingSkills: jobRequiredSkills || [],
        totalRequired: jobRequiredSkills?.length || 0,
        totalMatched: 0,
      };
    }

    // Normalize skills to lowercase for case-insensitive comparison
    const normalizedJobSeekerSkills = jobSeekerSkills
      .map((skill) =>
        typeof skill === "string"
          ? skill.toLowerCase().trim()
          : skill.name
          ? skill.name.toLowerCase().trim()
          : ""
      )
      .filter((skill) => skill);

    const normalizedRequiredSkills = jobRequiredSkills
      .map((skill) =>
        typeof skill === "string"
          ? skill.toLowerCase().trim()
          : skill.name
          ? skill.name.toLowerCase().trim()
          : ""
      )
      .filter((skill) => skill);

    // Find matched skills
    const matchedSkills = [];
    const missingSkills = [];

    normalizedRequiredSkills.forEach((requiredSkill) => {
      // Check for exact match or partial match
      const isMatched = normalizedJobSeekerSkills.some((seekerSkill) => {
        return (
          seekerSkill === requiredSkill ||
          seekerSkill.includes(requiredSkill) ||
          requiredSkill.includes(seekerSkill) ||
          SkillMatchingService.checkSimilarSkills(seekerSkill, requiredSkill)
        );
      });

      if (isMatched) {
        matchedSkills.push(requiredSkill);
      } else {
        missingSkills.push(requiredSkill);
      }
    });

    // Calculate percentage
    const percentage = Math.round(
      (matchedSkills.length / normalizedRequiredSkills.length) * 100
    );

    return {
      percentage,
      matchedSkills,
      missingSkills,
      totalRequired: normalizedRequiredSkills.length,
      totalMatched: matchedSkills.length,
      skillsBreakdown: {
        matched: matchedSkills,
        missing: missingSkills,
        jobSeekerSkills: normalizedJobSeekerSkills,
        requiredSkills: normalizedRequiredSkills,
      },
    };
  }

  /**
   * Check if two skills are similar (handle common variations)
   * @param {string} skill1
   * @param {string} skill2
   * @returns {boolean}
   */
  static checkSimilarSkills(skill1, skill2) {
    const skillSynonyms = {
      javascript: ["js", "ecmascript", "node.js", "nodejs"],
      typescript: ["ts"],
      react: ["reactjs", "react.js"],
      angular: ["angularjs"],
      vue: ["vuejs", "vue.js"],
      python: ["py"],
      "machine learning": ["ml", "artificial intelligence", "ai"],
      css: ["css3", "cascading style sheets"],
      html: ["html5", "hypertext markup language"],
      sql: ["mysql", "postgresql", "database"],
      "c++": ["cpp", "c plus plus"],
      "c#": ["csharp", "c sharp"],
      "ui/ux": ["user interface", "user experience", "ui design", "ux design"],
      frontend: ["front-end", "front end"],
      backend: ["back-end", "back end"],
      fullstack: ["full-stack", "full stack"],
      devops: ["dev ops", "development operations"],
      api: ["rest api", "restful", "web api"],
      aws: ["amazon web services"],
      gcp: ["google cloud platform"],
      azure: ["microsoft azure"],
    };

    // Check if either skill is a synonym of the other
    for (const [mainSkill, synonyms] of Object.entries(skillSynonyms)) {
      if (
        (skill1 === mainSkill && synonyms.includes(skill2)) ||
        (skill2 === mainSkill && synonyms.includes(skill1)) ||
        (synonyms.includes(skill1) && synonyms.includes(skill2))
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get skill match level description
   * @param {number} percentage
   * @returns {Object}
   */
  static getMatchLevel(percentage) {
    if (percentage >= 90) {
      return {
        level: "Excellent",
        color: "#10b981", // green
        description:
          "Outstanding skill match! You have almost all required skills.",
        icon: "🎯",
      };
    } else if (percentage >= 75) {
      return {
        level: "Good",
        color: "#059669", // dark green
        description: "Strong skill match! You meet most requirements.",
        icon: "✅",
      };
    } else if (percentage >= 50) {
      return {
        level: "Moderate",
        color: "#f59e0b", // yellow
        description: "Decent skill match. Consider developing missing skills.",
        icon: "⚡",
      };
    } else if (percentage >= 25) {
      return {
        level: "Fair",
        color: "#f97316", // orange
        description: "Some skills match. Significant skill development needed.",
        icon: "📈",
      };
    } else {
      return {
        level: "Low",
        color: "#ef4444", // red
        description:
          "Limited skill match. Consider skill development or alternative roles.",
        icon: "📚",
      };
    }
  }

  /**
   * Generate skill recommendations based on missing skills
   * @param {Array} missingSkills
   * @returns {Array}
   */
  static generateSkillRecommendations(missingSkills) {
    const learningPlatforms = {
      javascript: ["FreeCodeCamp", "MDN Web Docs", "JavaScript.info"],
      react: ["React Documentation", "React Tutorial", "Scrimba React Course"],
      python: ["Python.org Tutorial", "Codecademy Python", "Real Python"],
      "machine learning": ["Coursera ML Course", "Kaggle Learn", "Fast.ai"],
      sql: ["W3Schools SQL", "SQLBolt", "Mode SQL Tutorial"],
      aws: ["AWS Training", "A Cloud Guru", "AWS Documentation"],
      css: ["CSS-Tricks", "Flexbox Froggy", "Grid Garden"],
      "node.js": ["Node.js Documentation", "NodeSchool", "Express.js Tutorial"],
    };

    return missingSkills.map((skill) => ({
      skill,
      platforms: learningPlatforms[skill.toLowerCase()] || [
        "Coursera",
        "Udemy",
        "YouTube tutorials",
      ],
      priority: SkillMatchingService.getSkillPriority(skill),
    }));
  }

  /**
   * Get skill learning priority
   * @param {string} skill
   * @returns {string}
   */
  static getSkillPriority(skill) {
    const highPrioritySkills = [
      "javascript",
      "python",
      "react",
      "sql",
      "css",
      "html",
    ];
    const mediumPrioritySkills = [
      "node.js",
      "typescript",
      "angular",
      "vue",
      "aws",
      "docker",
    ];

    const normalizedSkill = skill.toLowerCase();

    if (highPrioritySkills.includes(normalizedSkill)) return "High";
    if (mediumPrioritySkills.includes(normalizedSkill)) return "Medium";
    return "Low";
  }
}

export default SkillMatchingService;
