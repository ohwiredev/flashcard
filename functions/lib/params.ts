/** Pages Functions types every route param as `string | string[]`, even single dynamic segments. */
export function paramString(value: string | string[]): string {
  return Array.isArray(value) ? value.join('/') : value
}
