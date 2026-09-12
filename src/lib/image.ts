const MAX_DIMENSION = 640
const JPEG_QUALITY = 0.8
const MAX_SOURCE_BYTES = 15 * 1024 * 1024 // guard against hanging the canvas on huge files

/**
 * Reads an image file and returns a resized, compressed data URL — cards are stored in
 * localStorage, which has no separate file storage, so keeping images small matters.
 */
export function fileToResizedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('That file is not an image.'))
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return Promise.reject(new Error('That image is too large.'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not load that image.'))
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
        const width = Math.max(1, Math.round(img.width * scale))
        const height = Math.max(1, Math.round(img.height * scale))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Image processing is not supported here.'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
