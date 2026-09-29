import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import { candidateRouter } from './routes/candidate.routes'

const PORT = 3001

const app = express()

app.use(candidateRouter)

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error)
  res.status(500).json({ message: 'Something went wrong' })
})

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
})
