import { UTFile } from 'uploadthing/server'
import { createId } from '../../lib/id'
import { errorResponse, json } from '../../lib/response'
import type { AppData, Env } from '../../lib/types'
import { getUTApi } from '../../lib/uploadthing'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export const onRequestPost: PagesFunction<Env, string, AppData> = async ({ request, env, data }) => {
  if (!data.user) return errorResponse('Not signed in.', 401)
  if (!env.UPLOADTHING_TOKEN) return errorResponse('Image uploads are not configured on this deployment.', 503)

  const contentType = request.headers.get('content-type') ?? ''
  const extension = ALLOWED_TYPES[contentType]
  if (!extension) return errorResponse('Unsupported image type.')

  const body = await request.arrayBuffer()
  if (body.byteLength === 0) return errorResponse('Empty upload.')
  if (body.byteLength > MAX_UPLOAD_BYTES) return errorResponse('Image is too large.')

  // UTFilePropertyBag extends DOM's BlobPropertyBag, which workers-types doesn't declare (it uses its
  // own BlobOptions name instead) — `type` is still a real, supported field at runtime.
  const file = new UTFile([body], `${data.user.id}-${createId()}.${extension}`, { type: contentType } as never)
  const result = await getUTApi(env).uploadFiles(file)

  if (result.error) {
    console.error('UploadThing upload failed:', result.error)
    return errorResponse(`Could not upload that image: ${result.error.message}`, 502)
  }

  return json({ url: result.data.ufsUrl }, { status: 201 })
}
