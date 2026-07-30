const ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: https://cars.importyourcar.co.nz/sitemap.xml
`;

export function onRequestGet() {
  return new Response(ROBOTS_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
