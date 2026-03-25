# ReqQuest

ReqQuest is an Angular-based API workbench for testing REST, GraphQL, and realtime connections from one UI.

## Features

- REST request builder with params, headers, auth, and environment variables
- GraphQL request editor and response viewer
- Realtime page with working WebSocket connect/send/receive flow
- SSE stream support (receive-only)
- Workspace settings for timeout, environments, and UI preferences

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm start
```

3. Open:

`http://localhost:5173`

## Scripts

- `npm start` - run dev server
- `npm run build` - production build
- `npm run test` - run tests (Vitest)
- `npm run preview` - preview built app

## Realtime Notes

- WebSocket: fully supported (`ws://` and `wss://`)
- SSE: supported for receiving events
- Socket.IO and MQTT: UI exists, transport layer not implemented yet
