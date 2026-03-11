import { searchPeople, extractNameFromTitle, guessEmail } from "./exaService";
import { PERSONA_GROUPS, buildGroupQuery, type PersonaGroup, type PersonaConfig } from "../config/personas";

export interface EnrichedContact {
  companyName: string;
  jobTitle: string;
  fullName: string;
  emailAddress: string;
  profileUrl?: string;
  verificationStatus: 'Verified' | 'Catch-All' | 'Invalid' | 'Unknown';
  verificationScore: number;
}

export interface EnrichmentProgress {
  completedGroups: number;
  totalGroups: number;
  contactsFound: number;
}

function simulateVerification(contact: Omit<EnrichedContact, 'verificationStatus' | 'verificationScore'>): EnrichedContact {
  const score = Math.floor(Math.random() * 40) + 60;
  let status: EnrichedContact['verificationStatus'] = 'Verified';
  if (score < 70) status = 'Unknown';
  else if (score < 85) status = 'Catch-All';
  return { ...contact, verificationStatus: status, verificationScore: score };
}

const TITLE_SYNONYMS: Record<string, string[]> = {
  'vice president': ['vp', 'v.p.', 'vice pres'],
  'director': ['dir'],
  'senior': ['sr', 'sr.'],
  'manager': ['mgr'],
  'chief technology officer': ['cto'],
  'chief marketing officer': ['cmo'],
  'chief executive officer': ['ceo'],
  'chief information officer': ['cio'],
  'chief information security officer': ['ciso'],
  'information technology': ['it', 'i.t.'],
};

function normalize(s: string): string {
  let lower = s.toLowerCase().trim();
  for (const [full, abbrs] of Object.entries(TITLE_SYNONYMS)) {
    for (const abbr of abbrs) {
      const re = new RegExp(`\\b${abbr.replace('.', '\\.')}\\b`, 'gi');
      lower = lower.replace(re, full);
    }
  }
  return lower
    .replace(/[,\-–—|@]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractActualTitle(resultTitle: string, resultText: string | undefined): string {
  const titleParts = resultTitle.split(/\s*[|]\s*/);
  if (titleParts.length >= 2) {
    const candidateRaw = titleParts[1];
    const candidate = candidateRaw
      .replace(/@\s*.+$/i, '')
      .replace(/\bat\s+.+$/i, '')
      .trim();
    if (candidate.length > 2 && candidate.length < 120) {
      return candidate;
    }
  }

  if (resultText) {
    const currentMatch = resultText.match(
      /### \s*(.+?)\s+at\s+\[.*?\]\(.*?\)\s*\(Current\)/i
    );
    if (currentMatch?.[1]) return currentMatch[1].trim();

    const headlineMatch = resultText.match(
      /^#\s+.+\n(.+)/m
    );
    if (headlineMatch?.[1]) {
      const headline = headlineMatch[1].trim();
      if (headline.length < 120 && !headline.startsWith('http')) {
        const cleaned = headline
          .replace(/@\s*.+$/i, '')
          .replace(/\bat\s+\[.+$/i, '')
          .trim();
        if (cleaned.length > 2) return cleaned;
      }
    }
  }

  if (titleParts.length >= 2) {
    const raw = titleParts.slice(1).join(' ').replace(/@\s*.+$/i, '').replace(/\bat\s+.+$/i, '').trim();
    if (raw.length > 2) return raw;
  }

  return '';
}

function matchesPersona(actualTitle: string, persona: PersonaConfig): boolean {
  const normActual = normalize(actualTitle);
  const normPersona = normalize(persona.title);

  if (normActual === normPersona) return true;
  if (normActual.includes(normPersona)) return true;
  if (normPersona.includes(normActual) && normActual.length > 5) return true;

  const personaWords = normPersona.split(' ').filter(w => w.length > 2);
  const matchCount = personaWords.filter(w => normActual.includes(w)).length;
  if (personaWords.length > 0 && matchCount / personaWords.length >= 0.7) return true;

  return false;
}

function findMatchingPersona(actualTitle: string, group: PersonaGroup): PersonaConfig | null {
  for (const persona of group.personas) {
    if (matchesPersona(actualTitle, persona)) return persona;
  }
  return null;
}

export async function enrichCompany(
  company: string,
  region?: string,
  selectedTitles?: Set<string>,
  onProgress?: (progress: EnrichmentProgress) => void
): Promise<EnrichedContact[]> {
  const allContacts: EnrichedContact[] = [];
  const seenUrls = new Set<string>();

  const queries = PERSONA_GROUPS.map((group) => ({
    group,
    query: buildGroupQuery(group, company, region, selectedTitles),
  })).filter((q) => q.query !== null);

  const totalGroups = queries.length;

  const results = await Promise.allSettled(
    queries.map(async ({ group, query }) => {
      const response = await searchPeople(query!, 10);
      return { group, response };
    })
  );

  let completedGroups = 0;
  for (const result of results) {
    completedGroups++;
    if (result.status === 'fulfilled') {
      const { group, response } = result.value;
      if (response.results) {
        for (const r of response.results) {
          const key = r.url || r.title;
          if (seenUrls.has(key)) continue;
          seenUrls.add(key);

          const actualTitle = extractActualTitle(r.title, r.text);
          if (!actualTitle) continue;

          const matched = findMatchingPersona(actualTitle, group);
          if (!matched) continue;
          if (selectedTitles && !selectedTitles.has(matched.title)) continue;

          const fullName = extractNameFromTitle(r.title);
          allContacts.push(
            simulateVerification({
              companyName: company,
              jobTitle: actualTitle,
              fullName,
              emailAddress: guessEmail(fullName, company),
              profileUrl: r.url,
            })
          );
        }
      }
    }
    onProgress?.({
      completedGroups,
      totalGroups,
      contactsFound: allContacts.length,
    });
  }

  return allContacts;
}
