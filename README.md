# TaskFlow - Trello Style App

A full-stack project using:
- Vue 3 + Vite + Pinia + Vue Router
- Express.js
- MongoDB + Mongoose
- JWT authentication

## Features
- Register and login
- Create multiple boards
- Default columns: To Do, In Progress, Done
- Add, edit, delete, and move tasks
- Add and rename columns
- Clean responsive UI

## Project Structure

```bash
trello-vue-express-mongo/
  client/
  server/
  README.md
```

## How to Run
1. Install dependencies:

```bash
cd server && npm install
cd ../client && npm install
```

2. Start the API:

```bash
cd server
npm run dev
```

3. Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

4. Open `http://localhost:5173`

## Local Development Notes

- The server now starts even if MongoDB is not installed.
- If `server/.env` does not include `MONGO_URI`, the app uses a local file store at `server/data/local-db.json`.
- To use MongoDB later, add `MONGO_URI=...` to `server/.env` and restart the server.
