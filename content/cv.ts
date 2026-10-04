import cvData from "@/content/cv-data.json";

export const cv = cvData;

export const cvContext = [
  `Nom : ${cv.fullName} (prénom d’usage : ${cv.preferredName}).`,
  `Rôle : ${cv.role}. Localisation : ${cv.location}. Âge indiqué sur le CV d’octobre 2026 : ${cv.ageAtCvDate}. ${cv.startedCoding}`,
  `Profil : ${cv.profile}`,
  `Formation scolaire : ${cv.education.title} — ${cv.education.details}`,
  `Apprentissage web : ${cv.learning.title} depuis ${cv.learning.startDate}, via ${cv.learning.provider}, plateforme dirigée par ${cv.learning.director}. Technologies abordées : ${cv.learning.topics.join(", ")}. ${cv.learning.nuance}`,
  cv.learningSourceNote,
  cv.selfDirectedLearning,
  `Cybersécurité : ${cv.cybersecurity}`,
  `Technologies et compétences indiquées : ${cv.skills.join(", ")}.`,
  `Forces : ${cv.strengths.join("; ")}.`,
  `Projets : ${cv.projects.map((project) => `${project.name} [${project.status}] — ${project.stack} : ${project.details}`).join(" ")}`,
  `Objectif professionnel : ${cv.careerGoal}`,
].join("\n");
