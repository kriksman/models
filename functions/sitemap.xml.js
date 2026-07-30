const GITHUB_LANDINGS_URL =
  "https://api.github.com/repos/kriksman/models/contents/landings?ref=main";
const RAW_BASE_URL =
  "https://raw.githubusercontent.com/kriksman/models/main/";
const SITE_BASE_URL = "https://cars.importyourcar.co.nz";
const CACHE_SECONDS = 3600;

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function getIndexableSlugs() {
  const landingsResponse = await fetch(GITHUB_LANDINGS_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "ImportYourCar-Sitemap",
    },
  });

  if (!landingsResponse.ok) {
    throw new Error(
      `GitHub landings request failed: ${landingsResponse.status}`,
    );
  }

  const landings = await landingsResponse.json();
  const pages = landings
    .filter((entry) => entry.type === "dir")
    .map((entry) => ({
      path: `${entry.path}/index.html`,
      slug: entry.name,
    }));

  const checks = await Promise.all(
    pages.map(async (page) => {
      const response = await fetch(`${RAW_BASE_URL}${page.path}`);
      if (!response.ok) return null;

      const html = await response.text();
      const robots = html.match(
        /<meta\s+name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      );

      return robots && /\bnoindex\b/i.test(robots[1]) ? null : page.slug;
    }),
  );

  return checks.filter(Boolean).sort();
}

function renderSitemap(slugs) {
  const urls = slugs
    .map(
      (slug) =>
        `  <url><loc>${escapeXml(`${SITE_BASE_URL}/${slug}/`)}</loc></url>`,
    )
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

export async function onRequestGet(context) {
  const cacheKey = new Request(context.request.url, { method: "GET" });
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const slugs = await getIndexableSlugs();
    const response = new Response(renderSitemap(slugs), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_SECONDS}`,
        "X-Content-Type-Options": "nosniff",
      },
    });

    context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (error) {
    return new Response("Unable to generate sitemap", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
