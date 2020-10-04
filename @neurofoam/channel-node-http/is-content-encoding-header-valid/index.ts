const regex = /^\s*identity\s*(?:,\s*identity\s*)*$/i;

export default function (contentEncoding: undefined | string): boolean {
  if (contentEncoding === undefined) {
    return true;
  }

  if (contentEncoding.trim() === ``) {
    return true;
  }

  return regex.test(contentEncoding);
}
