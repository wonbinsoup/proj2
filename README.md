## GymLog — MongoDB + Redis Database

A document-based workout tracking database built with MongoDB, extended with a Redis in-memory layer for personal records and leaderboard functionality. Adapted from a relational SQLite database (Project 1).

## Collections

- users — stores user accounts and embedded personal records
- exercises — stores exercises with embedded muscle group targets
- workouts — stores workout sessions with embedded sets

## Redis Layer

Personal records are cached in Redis using sorted sets for fast read access and leaderboard queries.

- Key format: `pr:<username>`
- Member: exercise name
- Score: max weight lifted (kg)

See `requirements.md` for full data structure descriptions and Redis commands.

## Setup

### Prerequisites
- MongoDB installed and running locally
- Redis running via Docker: `docker run -d --name redis -p 6379:6379 redis:latest`
- `mongoimport` available in PATH
- Node.js installed

### Import from JSON

```bash
mongoimport --db gymlog --collection users     --file data/users.json     --jsonArray
mongoimport --db gymlog --collection exercises --file data/exercises.json --jsonArray
mongoimport --db gymlog --collection workouts  --file data/workouts.json  --jsonArray
```

### Restore from dump

```bash
mongorestore --db gymlog ./data/gymlog_dump/gymlog
```

### Run Redis Script

```bash
cd redis
npm install
node index.js
```

## Queries

All MongoDB queries are in `queries/queries.js`. Run them in MongoDB Compass or the MongoDB shell:

```bash
use gymlog
```

## Files

```
gymlog-mongodb/
├── data/
│   ├── users.json
│   ├── exercises.json
│   ├── workouts.json
│   └── gymlog_dump/
├── queries/
│   └── queries.js
├── redis/
│   ├── index.js
│   └── package.json
├── requirements.md
└── README.md
```

## Videos
- Project 2 (MongoDB): https://www.youtube.com/watch?v=ZoNaY1aQ0zQ
- Project 3 (Redis): [add link after recording]