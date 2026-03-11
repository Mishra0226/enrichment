export interface PersonaConfig {
  title: string;
}

export interface PersonaGroup {
  name: string;
  personas: PersonaConfig[];
}

export const PERSONA_GROUPS: PersonaGroup[] = [
  {
    name: 'Marketing VP & Directors',
    personas: [
      { title: 'Vice President Marketing' },
      { title: 'Vice President International Marketing' },
      { title: 'Marketing Director' },
      { title: 'Director of Product Marketing' },
      { title: 'Senior Director of Marketing' },
      { title: 'Director of Marketing Operations' },
      { title: 'Digital Marketing Director' },
      { title: 'Global Marketing Director' },
    ],
  },
  {
    name: 'Marketing Managers, Content & Creative',
    personas: [
      { title: 'Marketing Manager' },
      { title: 'Senior Marketing Manager' },
      { title: 'Head of Marketing' },
      { title: 'Digital Asset Manager' },
      { title: 'Content Manager' },
      { title: 'Marketing Content Manager' },
      { title: 'Creative Director' },
    ],
  },
  {
    name: 'C-Suite',
    personas: [
      { title: 'Chief Technology Officer' },
      { title: 'Chief Marketing Officer' },
      { title: 'Chief Executive Officer' },
      { title: 'Chief Information Officer' },
      { title: 'Chief Information Security Officer' },
    ],
  },
  {
    name: 'IT & Technology',
    personas: [
      { title: 'Information Technology Manager' },
      { title: 'Head of Information Technology' },
      { title: 'Director of Technology' },
      { title: 'Director of Information Technology' },
      { title: 'Vice President Information Technology' },
      { title: 'Senior Information Technology Manager' },
    ],
  },
  {
    name: 'Enterprise Solutions',
    personas: [
      { title: 'Enterprise Solutions Architect' },
      { title: 'IT Director Enterprise Solutions' },
      { title: 'Enterprise Solutions Manager' },
    ],
  },
];

export const ALL_PERSONAS: PersonaConfig[] = PERSONA_GROUPS.flatMap(
  (g) => g.personas
);

export function buildGroupQuery(
  group: PersonaGroup,
  company: string,
  region?: string,
  selectedTitles?: Set<string>
): string | null {
  const active = selectedTitles
    ? group.personas.filter((p) => selectedTitles.has(p.title))
    : group.personas;
  if (active.length === 0) return null;

  const titlesPart = active.map((p) => p.title).join(' OR ');
  const regionSuffix = region ? ` in ${region}` : '';
  return `${titlesPart} at ${company}${regionSuffix}`;
}
