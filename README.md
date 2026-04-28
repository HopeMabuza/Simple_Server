# Simple_Server

A beginner project to learn Node.js and Express.js by building a simple HTTP server that counts sheep, automates incrementing, and saves history to a file.

## What it does

- Counts sheep manually or automatically every 5 seconds
- Saves every count and reset event to `history.json`
- Serves data through simple REST API routes

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — confirms server is running |
| `/sheep` | Returns the current sheep count |
| `/count` | Manually increments the sheep count by 1 |
| `/reset` | Resets the sheep count to 0 |
| `/history` | Returns the full history log from `history.json` |

## History log

Each entry in `history.json` looks like this:

```json
{
  "time": "2025-07-14T10:00:00.000Z",
  "sheep": 5,
  "type": "auto"
}
```

`type` is either `"auto"` (automated), `"manual"` (via `/count`), or `"reset"` (via `/reset`).

## Getting started

```bash
npm install
node server.js
```

Server runs on http://localhost:3000

## Tech used

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- `fs` module for reading/writing `history.json`
