export interface Env {
  DB: D1Database
  UPLOADTHING_TOKEN: string
}

export interface SessionUser {
  id: string
  email: string
}

export interface AppData {
  user: SessionUser | null
  [key: string]: unknown
}
