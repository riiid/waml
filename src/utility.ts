const digitPattern = /^([1-9]|1[0-9]|20)$/;
const lowerCasePattern = /^[a-z]$/;
const upperCasePattern = /^[A-Z]$/;

export function getCircledLetter(value: string): string {
  if (digitPattern.test(value)) {
    return String.fromCharCode(9311 + parseInt(value));
  }
  if (lowerCasePattern.test(value)) {
    return String.fromCharCode(9327 + value.charCodeAt(0));
  }
  if (upperCasePattern.test(value)) {
    return String.fromCharCode(9333 + value.charCodeAt(0));
  }
  return `(${value})`;
}
