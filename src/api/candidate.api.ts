import type { CandidateResponse, CandidateStatus } from '../types/candidate.types'

export type FetchCandidatesParams = {
  q?: string
  status?: CandidateStatus
  page?: number
  pageSize?: number
}

export async function fetchCandidates(
  params: FetchCandidatesParams = {},
  signal?: AbortSignal,
): Promise<CandidateResponse> {
  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set('q', params.q)
  if (params.status) searchParams.set('status', params.status)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))

  const response = await fetch(`/api/candidates?${searchParams}`, { signal })
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as CandidateResponse
}
