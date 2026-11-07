# PokeBattle

A small Pokémon app: a searchable grid of the first 898 Pokémon, Markdown export for a VirtualBrain brain, and a streamed battle between two selected Pokémon.

The browser talks only to this backend. PokeAPI and the chatbot API key stay on the server.

## Prerequisites

- Node.js 20 or newer
- A VirtualBrain brain with the exported Markdown imported, a chatbot created from that brain, and an API key

## Setup

Install each app on its own:

```bash
cd backend && npm install
cd ../web-app && npm install
```

### Backend

Create `backend/.env`. The server reads it on startup, so restart after any change.

```
PORT=3002
EXPORT_DIR=./exports/pokemons
VB_API_KEY=your-api-key
```

`VB_API_URL` is optional. It defaults to `https://chatbot-api.getvirtualbrain.com`.

`PORT` and `EXPORT_DIR` have the defaults above when omitted. `VB_API_KEY` does not: Fight returns an error until it is set. Generate the key from the brain that holds the Pokémon documents. The key is exchanged for a short-lived access token inside the server and is never sent to the browser.

## Run

In one terminal:

```bash
cd backend
npm run dev
```

In another:

```bash
cd web-app
npm run dev
```

Open http://localhost:5173. The API listens on http://localhost:3002. `npm run dev` in `web-app` proxies `/ping`, `/pokemons`, `/contents`, and `/battles` to that API. `GET /ping` returns `pong`.

Production builds:

```bash
cd web-app && npm run build
cd ../backend && npm run build && npm start
```

## VirtualBrain import

The battle chatbot only answers from documents in its brain. Export them once, from the `backend` directory so the files land in `backend/exports/pokemons`:

```bash
curl -sS http://localhost:3002/contents/all
```

That writes `001-bulbasaur.md` through `898-calyrex.md`. The folder is gitignored. Import it into a new brain, wait until indexing finishes, create a chatbot from that brain, and put that brain's API key in `VB_API_KEY`.

A quick check that the brain is the one behind the key:

```bash
curl -N -H 'content-type: application/json' \
  -d '{"pokemonIds":[1,4]}' \
  http://localhost:3002/battles
```

The body should be a battle, streamed as plain text.

## Using the app

Search is case-insensitive. Type chips add up: Fire and Electric together show Pokémon that have either type. Pick two cards, then Fight for one streamed story, or Turns for a round-by-round match whose narration streams the same way. Cancel stops the request, including the call to VirtualBrain.

## API

| Method | Path | Response |
| --- | --- | --- |
| GET | `/ping` | `pong` |
| GET | `/pokemons` | `{ pokemons }` summaries for ids 1–898: name, image, types, abilities, HP, Attack, Defense, Speed |
| GET | `/pokemons/:id` | `{ pokemon }` record the Markdown file is built from |
| GET | `/contents/:pokemonId` | One Markdown file, downloaded as `025-pikachu.md` |
| GET | `/contents/all` | Writes all 898 files and returns `{ dir, written, failed }` |
| POST | `/battles` | Body `{ "pokemonIds": [1, 4] }`. Chunked `text/plain` battle |
| POST | `/battles/turns` | Same body. Newline-delimited JSON: `{ "text" }` as the narration arrives, one resolved round, then `{ "winnerId": number \| null }` |

Ids must be integers from 1 to 898. `/battles` needs two different ids. Errors are JSON `{ "error": "..." }`.
