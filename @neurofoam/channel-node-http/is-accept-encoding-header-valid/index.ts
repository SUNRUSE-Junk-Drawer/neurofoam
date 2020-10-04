const regex = /(?:^|,)\s*(?:identity|\*)(?:;|\s|,|$)/i;

export function isAcceptEncodingHeaderValid(
  acceptEncoding: undefined | string
): boolean {
  if (acceptEncoding === undefined) {
    return true;
  }

  if (acceptEncoding.trim() === ``) {
    return true;
  }

  return regex.test(acceptEncoding);
}
