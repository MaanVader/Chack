import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  const html = `<!DOCTYPE html>
  <html>
    <body>
      <script>
        if (window.opener) {
          window.opener.postMessage({ type: "github-connected" }, "${origin}");
        }
        window.close();
      </script>
    </body>
  </html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
}
