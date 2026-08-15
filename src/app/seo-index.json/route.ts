export function GET(request: Request) {
  return Response.redirect(new URL("/editorial-index.json", request.url), 308);
}
