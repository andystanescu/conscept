import { NextResponse } from "next/server";

// Relative Location headers preserve the public host when the app runs
// behind a proxy that exposes an internal host such as 0.0.0.0:20011.
export function relativeRedirect(path: string, status = 303) {
  const response = new NextResponse(null, { status });
  response.headers.set("Location", path);
  return response;
}
