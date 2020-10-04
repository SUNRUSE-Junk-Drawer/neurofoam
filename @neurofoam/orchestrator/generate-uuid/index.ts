import * as util from "util";
import * as crypto from "crypto";

const cryptoRandomBytes = util.promisify(crypto.randomBytes).bind(crypto);

export default async function (): Promise<string> {
  const buffer = await cryptoRandomBytes(16);
  const hex = buffer.toString(`hex`);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16
  )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
