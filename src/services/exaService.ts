const EXA_API_KEY = process.env.EXA_API_KEY;

export interface ExaSearchResult {
  title: string;
  url: string;
  text?: string;
  highlights?: string[];
  publishedDate?: string;
  author?: string;
  score?: number;
}

export interface ExaSearchResponse {
  results: ExaSearchResult[];
  autopromptString?: string;
}

export async function searchPeople(
  query: string,
  numResults: number = 5
): Promise<ExaSearchResponse> {
  const response = await fetch('/api/exa/search', {
    method: 'POST',
    headers: {
      'x-api-key': EXA_API_KEY || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      category: 'people',
      numResults,
      contents: {
        text: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Exa API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export function extractNameFromTitle(title: string): string {
  if (!title) return '';
  const cleaned = title
    .replace(/\s*[-|–—]\s*LinkedIn.*$/i, '')
    .replace(/\s*[-|–—]\s*Profile.*$/i, '')
    .replace(/\s*\|.*$/, '')
    .trim();
  const parts = cleaned.split(/\s*[-–—,]\s*/);
  return parts[0]?.trim() || cleaned;
}

export function extractTitleFromText(text: string, persona: string): string {
  if (!text) return persona;
  const titlePatterns = [
    /(?:^|\n)\s*(?:Title|Position|Role|Current Role|Current Position)[:\s]+(.+)/im,
    /(?:^|\n)\s*(.+?)\s+at\s+/im,
  ];
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return persona;
}

export function guessEmail(fullName: string, company: string, website?: string): string {
  if (!fullName || !company) return '';
  const nameParts = fullName.toLowerCase().replace(/[^a-z\s-]/g, '').trim().split(/\s+/);
  if (nameParts.length === 0) return '';

  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];

  let domain = '';
  if (website) {
    domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  }
  if (!domain) {
    domain = company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  }

  return `${firstName}.${lastName}@${domain}`;
}
