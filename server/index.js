import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import authRoutes from './routes/auth.js'
import prosRoutes from './routes/pros.js'
import settingsRoutes from './routes/settings.js'
import exportsRoutes from './routes/exports.js'
import syncLicensesRoutes from './routes/sync-licenses.js'
import { convert, getSupportedCurrencies, RATES } from './utils/currency.js'
import { requireAuth } from './middleware/auth.js'
import { startScheduler } from './services/scheduler.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://royaltrack.vercel.app',
  ].filter(Boolean),
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/pros', prosRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/exports', exportsRoutes)
app.use('/api/sync-licenses', syncLicensesRoutes)

// Currency conversion
app.get('/api/currency/rates', (req, res) => {
  res.json({ rates: RATES, currencies: getSupportedCurrencies() })
})
app.get('/api/currency/convert', requireAuth, (req, res) => {
  const { amount, from = 'USD', to = 'USD' } = req.query
  if (!amount) return res.status(400).json({ error: 'amount is required' })
  const result = convert(parseFloat(amount), from, to)
  res.json({ from, to, amount: parseFloat(amount), converted: Math.round(result * 100) / 100 })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start scheduler
startScheduler()

app.listen(PORT, () => {
  console.log(`[server] RoyalTrack API running on http://localhost:${PORT}`)
})
