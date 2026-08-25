export interface ApiResponse<T> {
  data: T
}

export interface StrapiPagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

export interface StrapiListResponse<T> {
  data: T[]
  meta: {
    pagination: StrapiPagination
  }
}

export interface StrapiEntity {
  id: number
  documentId: string
  createdAt: string
  updatedAt: string
}