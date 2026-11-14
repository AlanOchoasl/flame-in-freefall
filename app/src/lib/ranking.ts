export type FactorId =
  | 'topicMatch'
  | 'solidFuelFlammability'
  | 'nasaFireSafetyLabel'
  | 'moonBaseAtmosphere'
  | 'microgravityProjectType';

export interface RankingFactorProfile {
  maxPoints: number;
  rationale: string;
  sourceQuote: string;
  primaryTopic?: string;
  primaryPoints?: number;
  otherFireSafetyPoints?: number;
  fuelPhases?: string[];
  labels?: string[];
  points?: number;
  pointsAtTenOrMore?: number;
  pointsAtOneToNine?: number;
  pointsAtZeroWithRows?: number;
  projectType?: string;
}

export interface RankingProfile {
  id: string;
  label: string;
  factors: Partial<Record<FactorId, RankingFactorProfile>>;
}

export interface RankingProfilesFile {
  schemaVersion: string;
  source: { name: string; url: string };
  profiles: RankingProfile[];
}

export interface CuratedValue<T> {
  value: T;
  source: string | null;
  reviewed: boolean;
}

export interface RankingInvestigation {
  accession: string;
  researchArea: string | null;
  projectType: string | null;
  subResearchArea: { normalized: string | null };
  curated: {
    fuelPhase: CuratedValue<string[]>;
    topics: CuratedValue<string[]>;
  };
}

export interface InvestigationTestCoverage {
  rowCount: number;
  moonBaseZoneCount: number;
}

export interface ScoreFactor {
  id: FactorId;
  points: number | null;
  maxPoints: number;
  status: 'assessed' | 'not-assessed';
  evidence: string;
}

export interface RankedInvestigation {
  investigation: RankingInvestigation;
  score: number;
  maximumScore: number;
  breakdown: ScoreFactor[];
  basedOnUnreviewedTags: boolean;
  nonCombustion: boolean;
  note: string | null;
}

const REQUIRED_FACTOR_IDS: FactorId[] = [
  'topicMatch',
  'solidFuelFlammability',
  'nasaFireSafetyLabel',
  'microgravityProjectType',
];

const LUNAR_PROFILE_ID = 'lunar-base-rover';
const FIRE_SAFETY_TOPICS = new Set(['material-flammability', 'detection', 'suppression']);
const REQUIRED_FACTOR_VALUES: Partial<Record<FactorId, (keyof RankingFactorProfile)[]>> = {
  topicMatch: ['primaryTopic', 'primaryPoints', 'otherFireSafetyPoints'],
  solidFuelFlammability: ['fuelPhases', 'points'],
  nasaFireSafetyLabel: ['labels', 'points'],
  moonBaseAtmosphere: ['pointsAtTenOrMore', 'pointsAtOneToNine', 'pointsAtZeroWithRows'],
  microgravityProjectType: ['projectType', 'points'],
};

/** Rejects incomplete profile data before it can silently change ranking behavior. */
export function validateRankingProfiles(file: RankingProfilesFile): void {
  const requiredProfiles = ['crew-cabin', LUNAR_PROFILE_ID, 'detection', 'suppression'];
  for (const profileId of requiredProfiles) {
    const profile = file.profiles.find((item) => item.id === profileId);
    if (!profile) throw new Error(`Missing ranking profile: ${profileId}`);

    const requiredFactors = profileId === LUNAR_PROFILE_ID
      ? [...REQUIRED_FACTOR_IDS, 'moonBaseAtmosphere' as const]
      : REQUIRED_FACTOR_IDS;
    for (const factorId of requiredFactors) {
      const factor = profile.factors[factorId];
      if (!factor) throw new Error(`Profile ${profileId} is missing factor weight: ${factorId}`);
      if (!Number.isFinite(factor.maxPoints) || factor.maxPoints < 0) {
        throw new Error(`Profile ${profileId} has an invalid maximum for ${factorId}`);
      }
      if (!factor.rationale.trim() || !factor.sourceQuote.trim()) {
        throw new Error(`Profile ${profileId} is missing rationale or source for ${factorId}`);
      }
      for (const key of REQUIRED_FACTOR_VALUES[factorId] ?? []) {
        if (factor[key] === undefined) throw new Error(`Profile ${profileId} is missing ${key} for ${factorId}`);
      }
      const pointValues = [
        factor.primaryPoints,
        factor.otherFireSafetyPoints,
        factor.points,
        factor.pointsAtTenOrMore,
        factor.pointsAtOneToNine,
        factor.pointsAtZeroWithRows,
      ].filter((value): value is number => value !== undefined);
      if (pointValues.some((value) => !Number.isFinite(value) || value < 0 || value > factor.maxPoints)) {
        throw new Error(`Profile ${profileId} has a point value outside the maximum for ${factorId}`);
      }
    }
  }
}

/** Scores investigations without mutating inputs or depending on application state. */
export function rankInvestigations(
  investigations: RankingInvestigation[],
  profile: RankingProfile,
  testCoverage: Record<string, InvestigationTestCoverage>,
): RankedInvestigation[] {
  return investigations
    .map((investigation) => scoreInvestigation(investigation, profile, testCoverage[investigation.accession]))
    .sort((left, right) => {
      if (left.nonCombustion !== right.nonCombustion) return left.nonCombustion ? 1 : -1;
      if (left.score !== right.score) return right.score - left.score;
      return compareAccessions(left.investigation.accession, right.investigation.accession);
    });
}

function scoreInvestigation(
  investigation: RankingInvestigation,
  profile: RankingProfile,
  coverage: InvestigationTestCoverage | undefined,
): RankedInvestigation {
  const breakdown: ScoreFactor[] = [];
  let basedOnUnreviewedTags = false;

  for (const [factorId, factorProfile] of Object.entries(profile.factors) as [FactorId, RankingFactorProfile][]) {
    const result = scoreFactor(factorId, factorProfile, investigation, coverage);
    breakdown.push(result);
    if (result.status === 'assessed' && isCuratedFactor(factorId)) {
      const curated = factorId === 'topicMatch' ? investigation.curated.topics : investigation.curated.fuelPhase;
      if (curated.value.length > 0 && !curated.reviewed) basedOnUnreviewedTags = true;
    }
  }

  const nonCombustion = investigation.researchArea !== 'Combustion Science';
  const score = breakdown.reduce((sum, factor) => sum + (factor.points ?? 0), 0);
  const maximumScore = breakdown.reduce((sum, factor) => sum + factor.maxPoints, 0);
  return {
    investigation,
    score,
    maximumScore,
    breakdown,
    basedOnUnreviewedTags,
    nonCombustion,
    note: nonCombustion ? 'Outside PSI Combustion Science; listed after combustion investigations.' : null,
  };
}

function scoreFactor(
  factorId: FactorId,
  profile: RankingFactorProfile,
  investigation: RankingInvestigation,
  coverage: InvestigationTestCoverage | undefined,
): ScoreFactor {
  switch (factorId) {
    case 'topicMatch': {
      const topics = investigation.curated.topics.value;
      if (!topics.length && !investigation.curated.topics.source) {
        return notAssessed(factorId, profile.maxPoints, 'No curated topic data.');
      }
      const points = topics.includes(profile.primaryTopic!)
        ? profile.primaryPoints!
        : topics.some((topic) => FIRE_SAFETY_TOPICS.has(topic))
          ? profile.otherFireSafetyPoints!
          : 0;
      return assessed(factorId, points, profile.maxPoints, `Topics: ${topics.join(', ') || 'none'}.`);
    }
    case 'solidFuelFlammability': {
      const phases = investigation.curated.fuelPhase.value;
      if (!phases.length && !investigation.curated.fuelPhase.source) {
        return notAssessed(factorId, profile.maxPoints, 'No curated fuel-phase data.');
      }
      const matches = phases.filter((phase) => profile.fuelPhases?.includes(phase));
      const points = matches.length ? profile.points! : 0;
      return assessed(factorId, points, profile.maxPoints, `Fuel phase: ${phases.join(', ') || 'none'}.`);
    }
    case 'nasaFireSafetyLabel': {
      const label = investigation.subResearchArea.normalized?.trim().toLowerCase();
      if (!label) return notAssessed(factorId, profile.maxPoints, 'No normalized PSI sub-area label.');
      const matches = profile.labels?.includes(label) ?? false;
      return assessed(factorId, matches ? profile.points! : 0, profile.maxPoints, `Normalized PSI sub-area: ${label}.`);
    }
    case 'moonBaseAtmosphere': {
      if (!coverage || coverage.rowCount === 0) {
        return notAssessed(factorId, profile.maxPoints, 'No normalized test data.');
      }
      const count = coverage.moonBaseZoneCount;
      const points = count >= 10
        ? profile.pointsAtTenOrMore!
        : count > 0
          ? profile.pointsAtOneToNine!
          : profile.pointsAtZeroWithRows!;
      return assessed(factorId, points, profile.maxPoints, `${count} test rows in the Moon-base atmosphere zone out of ${coverage.rowCount}.`);
    }
    case 'microgravityProjectType': {
      if (!investigation.projectType) {
        return notAssessed(factorId, profile.maxPoints, 'PSI project type is missing.');
      }
      const points = investigation.projectType === profile.projectType ? profile.points! : 0;
      return assessed(factorId, points, profile.maxPoints, `Project type: ${investigation.projectType}.`);
    }
  }
}

function assessed(id: FactorId, points: number, maxPoints: number, evidence: string): ScoreFactor {
  return { id, points, maxPoints, status: 'assessed', evidence };
}

function notAssessed(id: FactorId, maxPoints: number, evidence: string): ScoreFactor {
  return { id, points: null, maxPoints, status: 'not-assessed', evidence };
}

function isCuratedFactor(factorId: FactorId): boolean {
  return factorId === 'topicMatch' || factorId === 'solidFuelFlammability';
}

function compareAccessions(left: string, right: string): number {
  const leftNumber = Number(left.replace(/^PSI-/, ''));
  const rightNumber = Number(right.replace(/^PSI-/, ''));
  return leftNumber - rightNumber || left.localeCompare(right);
}
