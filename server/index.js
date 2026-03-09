import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './routes/auth.js'
import prosRoutes from './routes/pros.js'
import settingsRoutes from './routes/settings.js'
import { startScheduler } from './services/scheduler.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/pros', prosRoutes)
app.use('/api/settings', settingsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start scheduler
startScheduler()

app.listen(PORT, () => {
  console.log(`[server] RoyalTrack API running on http://localhost:${PORT}`)
})
