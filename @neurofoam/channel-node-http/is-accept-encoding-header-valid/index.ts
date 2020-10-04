const regex = /(?:^|,)\s*(?:identity|\*)(?:;|\s|,|$)/i;

export default function (acceptEncoding: undefined | string): boolean {
  if (acceptEncoding === undefined) {
    return true;
  }

  if (acceptEncoding.trim() === ``) {
    return true;
  }

  return regex.test(acceptEncoding);
}
