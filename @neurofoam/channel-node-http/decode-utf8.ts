import { TextDecoder } from "util";

const decoder = new TextDecoder(`utf-8`, { fatal: true })

export default function (
  buffer: Buffer,
): null | string {
  try {
    return decoder.decode(buffer)
  } catch {
    return null
  }
}
