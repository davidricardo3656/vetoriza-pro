# vetoriza-pro

Projeto pronto para deploy no Render (frontend + backend em um único container Docker).

## Como funciona

- Frontend: React + Vite + Tailwind (build gera `dist/`)
- Backend: Express em `backend/server.js` que expõe `/api/vectorize` e usa ImageMagick + Potrace via CLI para vetorização de alta qualidade.

## Rodando localmente com Docker

1. Instale Docker.
2. Build:
   ```bash
   docker build -t vetoriza-pro .
   ```
3. Run:
   ```bash
   docker run -p 3000:3000 vetoriza-pro
   ```
4. Acesse `http://localhost:3000`

## Deploy no Render

1. Suba este repositório no GitHub.
2. No Render, crie um novo **Web Service** apontando para o repo.
3. Escolha Docker (Render detecta Dockerfile).
4. Deploy e aguarde.

