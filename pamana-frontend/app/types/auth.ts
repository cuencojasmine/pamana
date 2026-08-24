export type PamanaRole =
  | 'Passenger'
  | 'Driver'
  | 'LGU'
  | 'Administrator'

export interface AuthRole {
  id: number
  name: PamanaRole | string
  type?: string
}

export interface AuthUser {
  id: number
  documentId?: string
  username: string
  email: string
  confirmed?: boolean
  blocked?: boolean
  role?: AuthRole
}

export interface LoginCredentials {
  identifier: string
  password: string
}

export interface LoginResponse {
  jwt: string
  user: AuthUser
}