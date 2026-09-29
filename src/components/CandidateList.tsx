import { useCandidateSearch } from '../hooks/useCandidateSearch'
import type { CandidateQuery, StatusFilter } from '../hooks/useCandidateSearch'
import { CANDIDATE_STATUSES } from '../types/candidate.types'
import './CandidateList.css'

const STATUS_OPTIONS: readonly StatusFilter[] = ['all', ...CANDIDATE_STATUSES]

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

function formatStatus(status: StatusFilter): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function describeFilters({ q, status }: CandidateQuery): string {
  const parts = []
  if (q) parts.push(`matching “${q}”`)
  if (status !== 'all') parts.push(`with status ${formatStatus(status)}`)
  return parts.join(' ')
}

export function CandidateList() {
  const {
    searchInput,
    setSearchInput,
    query,
    response,
    isLoading,
    error,
    hasPreviousPage,
    hasNextPage,
    setStatus,
    goToPreviousPage,
    goToNextPage,
    goToFirstPage,
    clearFilters,
    retry,
  } = useCandidateSearch()

  const hasFilters = query.q !== '' || query.status !== 'all'
  const totalPages = response
    ? Math.max(1, Math.ceil(response.total / response.pageSize))
    : 1

  function renderResults() {
    if (error) {
      return (
        <div className="candidates-message" role="alert">
          <h2>Couldn’t load candidates</h2>
          <p>{error}</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </div>
      )
    }

    if (!response) {
      return (
        <div className="candidates-message" role="status">
          <p>Loading candidates…</p>
        </div>
      )
    }

    if (response.data.length === 0) {
      if (response.total > 0) {
        return (
          <div className="candidates-message">
            <h2>Nothing on this page</h2>
            <p>There are {response.total} candidates, but this page is past the end.</p>
            <button type="button" onClick={goToFirstPage}>
              Back to first page
            </button>
          </div>
        )
      }

      if (hasFilters) {
        return (
          <div className="candidates-message">
            <h2>No candidates found</h2>
            <p>No candidates {describeFilters(query)}. Try a different search or status.</p>
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )
      }

      return (
        <div className="candidates-message">
          <h2>No candidates yet</h2>
          <p>Candidates will show up here once they are added.</p>
        </div>
      )
    }

    return (
      <table className="candidates-table" aria-busy={isLoading}>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Status</th>
            <th scope="col">Last updated</th>
          </tr>
        </thead>
        <tbody>
          {response.data.map((candidate) => (
            <tr key={candidate.id}>
              <td>{candidate.name}</td>
              <td>
                <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
              </td>
              <td>
                <span className="candidates-status">{formatStatus(candidate.status)}</span>
              </td>
              <td>
                <time dateTime={candidate.updatedAt}>{formatDate(candidate.updatedAt)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <main className="candidates">
      <h1>Candidates</h1>

      <div className="candidates-filters">
        <label>
          Search
          <input
            type="search"
            placeholder="Name or email"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </label>

        <label>
          Status
          <select
            value={query.status}
            onChange={(event) => {
              const status = STATUS_OPTIONS.find((option) => option === event.target.value)
              if (status) setStatus(status)
            }}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="candidates-summary" role="status">
        {isLoading
          ? 'Loading…'
          : response && `${response.total} ${response.total === 1 ? 'candidate' : 'candidates'}`}
      </p>

      {renderResults()}

      <nav className="candidates-pagination" aria-label="Pagination">
        <button type="button" onClick={goToPreviousPage} disabled={!hasPreviousPage}>
          Previous
        </button>
        <span>
          Page {query.page} of {totalPages}
        </span>
        <button type="button" onClick={goToNextPage} disabled={!hasNextPage}>
          Next
        </button>
      </nav>
    </main>
  )
}
