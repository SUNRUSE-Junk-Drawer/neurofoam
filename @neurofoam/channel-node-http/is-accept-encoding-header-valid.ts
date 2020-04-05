const regex = /(?:^|,)\s*(?:identity|\*)(?:;|\s|,|$)/

export default function (
  accept: undefined | string,
): boolean {
  if (accept === undefined) {
    return true
  }

  if (accept.trim() === ``) {
    return true
  }

  return regex.test(accept)
}
