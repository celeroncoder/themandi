// app/api/image-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { promises as fs } from "fs";
import mime from "mime-types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 },
    );
  }

  try {
    // Handle local files from public directory
    if (imageUrl.startsWith("/") && !/^https?:\/\//i.test(imageUrl)) {
      try {
        const publicPath = join(process.cwd(), "public");
        const filePath = join(publicPath, imageUrl);

        // PREVENT DIRECTORY TRAVERSAL ATTACKS
        if (!filePath.startsWith(publicPath)) {
          return NextResponse.json({ error: "Invalid path" }, { status: 400 });
        }

        const fileBuffer = await fs.readFile(filePath);
        const contentType = mime.lookup(imageUrl) || "application/octet-stream";

        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === "ENOENT") {
          return NextResponse.json(
            { error: "File not found" },
            { status: 404 },
          );
        }
        console.error(error instanceof Error ? error.message : error);
      }
    }

    // Handle external URLs
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: response.status },
      );
    }

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": headers.get("content-type") || "image/jpeg",
        "Cache-Control": headers.get("Cache-Control")!,
      },
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "An error occurred while fetching the image" },
      { status: 500 },
    );
  }
}
