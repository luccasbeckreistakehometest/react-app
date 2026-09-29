import { InMemoryCandidateRepository } from '../repositories/candidate.repository'
import type { CandidateRepository } from '../repositories/candidate.repository'
import { CANDIDATE_STATUSES } from '../types/candidate.types'
import type {
  CandidateResponse,
  CandidateStatus,
  ListCandidateParams,
} from '../types/candidate.types'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50
const VALID_STATUSES: readonly CandidateStatus[] = CANDIDATE_STATUSES

function parsePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' && typeof value !== 'string') return fallback
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : fallback
}

function parseQuery(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

// An invalid status is treated as no filter
function parseStatus(value: unknown): CandidateStatus | undefined {
  return VALID_STATUSES.find((status) => status === value)
}

export async function listCandidates(
  params: ListCandidateParams = {},
  repository: CandidateRepository = new InMemoryCandidateRepository(),
): Promise<CandidateResponse> {
  const pageSize = Math.min(
    parsePositiveInt(params.pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  )
  const page = parsePositiveInt(params.page, DEFAULT_PAGE)
  const q = parseQuery(params.q)
  const status = parseStatus(params.status)

  const candidates = await repository.findAll()
  const filtered = candidates.filter(
    (candidate) =>
      (!status || candidate.status === status) &&
      (!q ||
        candidate.name.toLowerCase().includes(q) ||
        candidate.email.toLowerCase().includes(q)),
  )

  const start = (page - 1) * pageSize

  return {
    data: filtered.slice(start, start + pageSize),
    page,
    pageSize,
    total: filtered.length,
  }
}
