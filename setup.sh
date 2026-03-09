#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RoyalTrack — Supabase Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Login to Supabase
echo "[1/5] Logging in to Supabase..."
npx supabase login

# 2. Link to project
echo ""
echo "[2/5] Link your Supabase project"
echo "  You can find your project ref in: Supabase Dashboard → Settings → General"
read -p "  Enter your project ref (e.g. abcdefghijkl): " PROJECT_REF

npx supabase link --project-ref "$PROJECT_REF"

# 3. Run migrations
echo ""
echo "[3/5] Running database migrations..."
npx supabase db push

echo "  ✓ Tables and RLS policies created"

# 4. Fetch project keys
echo ""
echo "[4/5] Fetching project API keys..."

API_URL=$(npx supabase inspect db info --format json 2>/dev/null | head -1 || echo "")

# Prompt for keys since they can't always be auto-fetched
echo "  Go to: Supabase Dashboard → Settings → API"
echo ""
read -p "  Paste your Project URL: " SUPABASE_URL
read -p "  Paste your anon (public) key: " SUPABASE_ANON_KEY
read -p "  Paste your service_role (secret) key: " SUPABASE_SERVICE_KEY

# 5. Generate .env and encryption key
echo ""
echo "[5/5] Generating server/.env..."

ENCRYPTION_KEY=$(openssl rand -hex 32)

cat > server/.env << ENVEOF
PORT=3001
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
FRONTEND_URL=http://localhost:5173
ENVEOF

echo "  ✓ server/.env created"
echo "  ✓ Encryption key generated: ${ENCRYPTION_KEY:0:8}..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setup complete! Start the app:"
echo ""
echo "  Terminal 1:  cd server && npm run dev"
echo "  Terminal 2:  npm run dev"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
