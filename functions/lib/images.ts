/** Card image columns store the served UploadThing CDN URL directly (".../f/<fileKey>"). */
export function extractFileKey(value: string | null | undefined): string | null {
  if (!value) return null
  const match = value.match(/\/f\/([^/?#]+)/)
  return match ? match[1] : null
}
