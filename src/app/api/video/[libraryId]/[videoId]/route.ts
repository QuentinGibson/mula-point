import { NextResponse } from "next/server";
import { createBunnyCdnStream } from "@/app/bunny";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ libraryId: string, videoId: string }> }
) {
  try {
    // Get the libraryId and videoId from params
    const { libraryId, videoId } = await params

    // Create a Bunny connection
    const bunnyCdnStream = createBunnyCdnStream(libraryId)

    // Get video details
    const video = await bunnyCdnStream.getVideo(videoId)

    // const resolutions = video.resolutions

    // Create the url that all videos start from
    const baseUrl = `https://vz-${video.guid}.b-cdn.net/${video.guid}`

    // Create a list of sources for different resolutions
    const sources = {
      'auto': `${baseUrl}/playlist.m3u8`,
      '240p': `${baseUrl}/play_240p.mp4`,
      '360p': `${baseUrl}/play_360p.mp4`,
      '720p': `${baseUrl}/play_720p.mp4`,
      '1080p': `${baseUrl}/play_1080p.mp4`
    }

    // Create the iframeUrl
    const iframeUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;

    return NextResponse.json({
      sources,
      iframeUrl
    });
  } catch (error) {
    console.error("Error fetching video data:", error);
    return NextResponse.json(
      { error: "Failed to fetch video data" },
      { status: 500 }
    );
  }
}

