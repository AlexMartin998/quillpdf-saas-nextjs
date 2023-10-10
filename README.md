# TesloShop

This is a Next.js project bootstrapped with `pnpm create next-app --typescript`.

## Features

⚡️ Next.js v13\
⚡️ tRPC\
⚡️ OpenAI\
⚡️ TailwindCSS\
⚡️ Shadcn UI\
⚡ Docker

## Getting Started

### .env

Create `.env` file based on `.env.template`

### Run the development server with Docker 🐳 :

```bash
# install pnpm
npm i -g pnpm

# install deps
pnpm i

# run docker contaniers
docker compose -f docker-compose.dev.yml up --build

# run dev server
pnpm run dev

# stop and remove containers & networks
docker compose -f docker-compose.dev.yml down

```

#### Executing SEED

```bash
# HTTP Get request

curl http://localhost:3000/api/seed
```

### Run the production server with Docker 🐳 :

```bash
# run db
docker compose -f docker-compose.dev.yml up --build

# Executing SEED: HTTP Get request
curl http://localhost:3000/api/seed

# docker compose
docker compose up --build -d

```

## View demo

To see the real-time behavior you have to create an account

<a href="https://quillpdf-saas-nextjs.vercel.app" target="_blank">Demo</a>

### Screenshots

![Admi](.screenshots/chatpdf-page.png)



| | | 
|:-------------------------:|:-------------------------:|
| <img width="1604" src=".screenshots/landing.png">    |  <img width="1604" src=".screenshots/uploader.png"> 
| 