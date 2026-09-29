import { useEffect, useState } from 'react'
import { fetchCandidates } from '../api/candidate.api'
import type { CandidateResponse, CandidateStatus } from '../types/candidate.types'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

export type StatusFilter = CandidateStatus | 'all'

export type CandidateQuery = {
  q: string
  status: StatusFilter
  page: number
}

type SettledRequest = {
  query: CandidateQuery
  response: CandidateResponse | null
  error: string | null
}

const INITIAL_QUERY: CandidateQuery = { q: '', status: 'all', page: 1 }

export function useCandidateSearch() {
  const [searchInput, setSearchInput] = useState('')
  // One request is made per `query` object, so it only changes when a new request is wanted
  const [query, setQuery] = useState<CandidateQuery>(INITIAL_QUERY)
  const [settled, setSettled] = useState<SettledRequest | null>(null)

  // Wait for typing to pause before searching; a new search term goes back to page 1
  useEffect(() => {
    const q = searchInput.trim()
    const timeout = setTimeout(() => {
      setQuery((current) => (current.q === q ? current : { ...current, q, page: 1 }))
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [searchInput])

  // Aborting on cleanup means an older request can never overwrite a newer one
  useEffect(() => {
    const controller = new AbortController()

    fetchCandidates(
      {
        q: query.q || undefined,
        status: query.status === 'all' ? undefined : query.status,
        page: query.page,
        pageSize: PAGE_SIZE,
      },
      controller.signal,
    )
      .then((response) => {
        if (controller.signal.aborted) return
        setSettled({ query, response, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : 'Unknown error'
        setSettled({ query, response: null, error: message })
      })

    return () => controller.abort()
  }, [query])

  const isLoading = settled?.query !== query
  // While the next request is loading, the previous results stay on screen
  const response = settled?.response ?? null
  const error = isLoading ? null : (settled?.error ?? null)

  const hasPreviousPage = query.page > 1
  const hasNextPage =
    !isLoading && response !== null && response.page * response.pageSize < response.total

  return {
    searchInput,
    setSearchInput,
    query,
    response,
    isLoading,
    error,
    hasPreviousPage,
    hasNextPage,
    // Applies any search text still waiting on the debounce, so only one request is made
    setStatus: (status: StatusFilter) =>
      setQuery({ q: searchInput.trim(), status, page: 1 }),
    goToPreviousPage: () =>
      setQuery((current) => ({ ...current, page: Math.max(1, current.page - 1) })),
    goToNextPage: () => setQuery((current) => ({ ...current, page: current.page + 1 })),
    goToFirstPage: () => setQuery((current) => ({ ...current, page: 1 })),
    clearFilters: () => {
      setSearchInput('')
      setQuery({ ...INITIAL_QUERY })
    },
    retry: () => setQuery((current) => ({ ...current })),
  }
}
