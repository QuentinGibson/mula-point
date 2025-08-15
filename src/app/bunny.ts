import { BunnyCdnStream } from "bunnycdn-stream";

export const createBunnyCdnStream = (libraryId: string) => {
  return new BunnyCdnStream({
    apiKey: process.env.BUNNY_API_KEY!,
    videoLibrary: libraryId
  })
}
