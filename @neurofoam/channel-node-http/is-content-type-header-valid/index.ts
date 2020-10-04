const regex = /^\s*application\s*\/\s*json\s*(?:;\s*charset\s*=\s*utf-8\s*)?$/i;

export function isContentTypeHeaderValid(accept: undefined | string): boolean {
  if (accept === undefined) {
    return true;
  }

  if (accept.trim() === ``) {
    return true;
  }

  return regex.test(accept);
}
