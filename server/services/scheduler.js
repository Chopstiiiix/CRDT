import cron from 'node-cron'
import { syncAllConnections } from './proSync.js'

export function startScheduler() {
  // Every 6 hours: refresh royalty data for all connections
  cron.schedule('0 */6 * * *', async () => {
    console.log('[cron] Starting scheduled royalty sync…')
    await syncAllConnections()
  })

  // Daily at midnight: could check for new statements, send notifications, etc.
  cron.schedule('0 0 * * *', () => {
    console.log('[cron] Daily maintenance check')
    // Future: email notifications for new payments
  })

  console.log('[scheduler] Cron jobs registered (sync every 6h, daily check at midnight)')
}
