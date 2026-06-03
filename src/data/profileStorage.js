/**
 * profileStorage.js
 * All localStorage CRUD for user profiles and job applications.
 * Keys used:
 *   geojobs_profile_{userId}   → seeker profile object
 *   geojobs_empprofile_{userId}→ employer profile object
 *   geojobs_applications       → array of all application objects
 */

// ─── Seeker Profile ────────────────────────────────────────────────────────

export function getProfile(userId) {
  try {
    const raw = localStorage.getItem(`geojobs_profile_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(userId, profileData) {
  try {
    const profile = { ...profileData, userId, updatedAt: new Date().toISOString() };
    localStorage.setItem(`geojobs_profile_${userId}`, JSON.stringify(profile));
    return profile;
  } catch {
    return null;
  }
}

export function isProfileComplete(profile) {
  if (!profile) return false;
  const required = ['name', 'headline', 'skills'];
  return required.every((key) => profile[key] && profile[key].length > 0);
}

export function getProfileCompletion(profile) {
  if (!profile) return 0;
  const fields = ['name', 'headline', 'location', 'currentRole', 'yearsExp', 'bio', 'skills', 'linkedin', 'portfolio', 'resumeLink', 'avatar'];
  const filled = fields.filter((f) => profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : profile[f].trim() !== ''));
  return Math.round((filled.length / fields.length) * 100);
}

// ─── Employer Profile ──────────────────────────────────────────────────────

export function getEmployerProfile(userId) {
  try {
    const raw = localStorage.getItem(`geojobs_empprofile_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveEmployerProfile(userId, profileData) {
  try {
    const profile = { ...profileData, userId, updatedAt: new Date().toISOString() };
    localStorage.setItem(`geojobs_empprofile_${userId}`, JSON.stringify(profile));
    return profile;
  } catch {
    return null;
  }
}

// ─── Applications ──────────────────────────────────────────────────────────

function getAllApplications() {
  try {
    const raw = localStorage.getItem('geojobs_applications');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setAllApplications(apps) {
  localStorage.setItem('geojobs_applications', JSON.stringify(apps));
}

export function saveApplication(application) {
  const apps = getAllApplications();
  const newApp = {
    ...application,
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    appliedAt: new Date().toISOString(),
    status: 'Applied', // Applied | Viewed | Shortlisted | Rejected
  };
  apps.unshift(newApp);
  setAllApplications(apps);
  return newApp;
}

export function getApplicationsBySeeker(seekerId) {
  return getAllApplications().filter((a) => a.seekerId === seekerId);
}

export function getApplicationsByJob(jobId) {
  return getAllApplications().filter((a) => a.jobId === jobId);
}

export function getApplicationsByEmployer(employerId) {
  return getAllApplications().filter((a) => a.employerId === employerId);
}

export function hasApplied(seekerId, jobId) {
  return getAllApplications().some((a) => a.seekerId === seekerId && a.jobId === jobId);
}

export function updateApplicationStatus(appId, status) {
  const apps = getAllApplications();
  const idx = apps.findIndex((a) => a.id === appId);
  if (idx !== -1) {
    apps[idx] = { ...apps[idx], status, updatedAt: new Date().toISOString() };
    setAllApplications(apps);
    return apps[idx];
  }
  return null;
}

export function getAppliedJobIds(seekerId) {
  return getAllApplications()
    .filter((a) => a.seekerId === seekerId)
    .map((a) => a.jobId);
}

// ─── Skill Matching (for Recommended tab) ──────────────────────────────────

export function getRecommendedJobs(profile, allJobs) {
  if (!profile || !profile.skills || profile.skills.length === 0) return [];

  const seekerSkills = profile.skills.map((s) => s.toLowerCase());

  return allJobs
    .map((job) => {
      const jobText = [
        job.title,
        job.description,
        ...(job.requirements || []),
        job.industry,
      ]
        .join(' ')
        .toLowerCase();

      const matchCount = seekerSkills.filter((skill) => jobText.includes(skill)).length;
      return { job, matchCount };
    })
    .filter((r) => r.matchCount >= 1)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 12)
    .map((r) => r.job);
}

// ─── Predefined Skills List ────────────────────────────────────────────────

export const SKILLS_LIST = [
  // Tech
  'React', 'Vue', 'Angular', 'Next.js', 'TypeScript', 'JavaScript', 'Python',
  'Node.js', 'Django', 'FastAPI', 'Java', 'Kotlin', 'Swift', 'Go', 'Rust',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB',
  'GraphQL', 'REST APIs', 'Git', 'Linux', 'Terraform', 'Redis',
  // Design
  'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'After Effects',
  'UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'Framer',
  // Marketing
  'SEO', 'Google Ads', 'Meta Ads', 'Content Writing', 'Copywriting',
  'Email Marketing', 'HubSpot', 'Salesforce', 'Brand Strategy', 'Analytics',
  // Finance & Ops
  'Excel', 'Power BI', 'Tableau', 'Financial Modeling', 'Project Management',
  'Agile', 'Scrum', 'JIRA', 'Product Management', 'Data Analysis', 'SQL',
];

export const AVATAR_OPTIONS = [
  '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎨', '👩‍🎨', '🧑‍🎨',
  '👨‍🔬', '👩‍🔬', '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🏫',
  '👩‍🏫', '🧑‍🚀', '👨‍🔧', '👩‍🔧', '🦸', '🦸‍♀️',
  '🧙', '🧙‍♀️',
];

export const COMPANY_AVATAR_OPTIONS = [
  '🏢', '🏬', '🏦', '🏗️', '🏭', '🚀', '💡', '🎯',
  '⚡', '🌐', '🔮', '💎', '🦁', '🐉', '🦅', '🌊',
  '🔬', '🎨', '📡', '🛡️',
];

export const YEARS_EXP_OPTIONS = [
  { label: 'Less than 1 year', value: '<1' },
  { label: '1 – 3 years', value: '1-3' },
  { label: '3 – 5 years', value: '3-5' },
  { label: '5 – 10 years', value: '5-10' },
  { label: '10+ years', value: '10+' },
];

export const COMPANY_SIZE_OPTIONS = [
  '1 – 10 (Startup)',
  '11 – 50 (Small)',
  '51 – 200 (Mid-size)',
  '201 – 1000 (Large)',
  '1000+ (Enterprise)',
];
