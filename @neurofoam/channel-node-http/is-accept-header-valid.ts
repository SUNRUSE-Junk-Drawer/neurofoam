const regex = /(?:^|,)\s*(?:application|\*)\s*\/\s*(?:json|\*)(?:;|\s|,|;|$)/

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
