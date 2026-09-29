import { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import { listCandidates } from '../services/candidate.service'

export const candidateRouter = Router()

candidateRouter.get(
  '/api/candidates',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, status, page, pageSize } = req.query
      const response = await listCandidates({ q, status, page, pageSize })
      res.json(response)
    } catch (error) {
      next(error)
    }
  },
)
