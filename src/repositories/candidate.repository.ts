import type { Candidate } from '../types/candidate.types'

export interface CandidateRepository {
  findAll(): Promise<Candidate[]>
}

const candidates: Candidate[] = [
  {
    id: '1',
    name: 'Aisha Khan',
    email: 'aisha@example.com',
    status: 'interviewing',
    updatedAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: '2',
    name: 'Marco Silva',
    email: 'marco@example.com',
    status: 'new',
    updatedAt: '2026-08-21T10:00:00.000Z',
  },
  {
    id: '3',
    name: 'Priya Shah',
    email: 'priya@example.com',
    status: 'hired',
    updatedAt: '2026-08-22T10:00:00.000Z',
  },
]

export class InMemoryCandidateRepository implements CandidateRepository {
  private readonly candidates: Candidate[]

  constructor(initialCandidates: Candidate[] = candidates) {
    this.candidates = initialCandidates
  }

  async findAll(): Promise<Candidate[]> {
    return [...this.candidates]
  }
}
