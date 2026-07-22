// Brand list for the bike/component "Brand" fields, sourced from BikeIndex's
// public manufacturer registry: https://bikeindex.org/documentation/api_v3
//
// The endpoint ignores per_page above 100 and exposes no total-count field,
// so we page until a page comes back short, fetching in small parallel
// batches. Results rarely change, so each page is cached for a day via
// Next.js's fetch cache.

const MANUFACTURERS_URL = "https://bikeindex.org/api/v3/manufacturers";
const PER_PAGE = 100;
const BATCH_SIZE = 5;
const MAX_PAGES = 30; // safety cap, well above the ~15 pages this list needs today

export interface BikeIndexManufacturer {
  id: number;
  name: string;
  short_name: string | null;
  company_url: string | null;
}

async function fetchManufacturerPage(page: number): Promise<BikeIndexManufacturer[]> {
  try {
    const res = await fetch(`${MANUFACTURERS_URL}?page=${page}&per_page=${PER_PAGE}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { manufacturers?: BikeIndexManufacturer[] };
    return data.manufacturers ?? [];
  } catch {
    // Network hiccup or BikeIndex is down — degrade to an empty list rather
    // than blocking the form; users can still type a brand by hand.
    return [];
  }
}

export async function getBikeIndexManufacturers(): Promise<string[]> {
  const all: BikeIndexManufacturer[] = [];

  for (let page = 1; page <= MAX_PAGES; page += BATCH_SIZE) {
    const batch = await Promise.all(
      Array.from({ length: BATCH_SIZE }, (_, i) => fetchManufacturerPage(page + i))
    );
    let reachedEnd = false;
    for (const items of batch) {
      all.push(...items);
      if (items.length < PER_PAGE) reachedEnd = true;
    }
    if (reachedEnd) break;
  }

  return all
    .map((m) => m.name)
    .filter((name, i, arr) => arr.indexOf(name) === i)
    .sort((a, b) => a.localeCompare(b));
}
