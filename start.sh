#!/bin/bash
# Inicia a API (FastAPI) e a Plataforma (Next.js) em paralelo

echo "Iniciando V4 Skills Platform..."

# API na porta 8000
(cd "$(dirname "$0")" && python3 -m uvicorn api.main:app --reload --port 8000) &
API_PID=$!

# Plataforma na porta 3000
(cd "$(dirname "$0")/platform" && npm run dev) &
PLATFORM_PID=$!

echo ""
echo "API rodando em:       http://localhost:8000"
echo "Plataforma rodando em: http://localhost:3000"
echo ""
echo "Pressione Ctrl+C para parar tudo."

trap "kill $API_PID $PLATFORM_PID 2>/dev/null" EXIT
wait
