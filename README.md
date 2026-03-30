## GymLog — MongoDB Database

A document-based workout tracking database built with MongoDB. Adapted from a relational SQLite database (Project 1) to use embedded documents and collections.

## Collections

- users — stores user accounts and embedded personal records
- exercises — stores exercises with embedded muscle group targets
- workouts — stores workout sessions with embedded sets

## Setup

### Prerequisites
- MongoDB installed and running locally
- `mongoimport` and `mongodump`/`mongorestore` available in PATH

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

## Queries

All queries are in `queries/queries.js`. Run them in MongoDB Compass (mongosh tab) or the MongoDB shell after switching to the gymlog database:

```bash
use gymlog
```

## Files

```
gymlog-mongodb/
|-- data/
│   ├── users.json
│   ├── exercises.json
│   ├── workouts.json
│   |-- gymlog_dump/       
├── queries/
│   |── queries.js
|-- README.md
```

## Youtube Video
https://www.youtube.com/watch?v=ZoNaY1aQ0zQ 
