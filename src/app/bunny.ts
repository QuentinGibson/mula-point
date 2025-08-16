import { BunnyCdnStream } from "bunnycdn-stream";


export const createBunnyCdnStream = (libraryId: string) => {
  if (process.env.BUNNY_API_KEY === undefined) {
    throw new Error("Need Bunny API KEY!")
  }

  console.log("bunny key found!")

  return new BunnyCdnStream({
    apiKey: process.env.BUNNY_API_KEY,
    videoLibrary: libraryId
  })
}
