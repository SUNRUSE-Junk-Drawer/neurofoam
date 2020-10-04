const regex = /(?:^|,)\s*(?:utf-8|\*)\s*(?:$|;|,)/i;

export default function (acceptCharset: undefined | string): boolean {
  if (acceptCharset === undefined) {
    return true;
  }

  if (acceptCharset.trim() === ``) {
    return true;
  }

  return regex.test(acceptCharset);
}
