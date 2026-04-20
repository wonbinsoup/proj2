# GymLog — Project 3: Redis In-Memory Key-Value Store

## Problem Requirements

GymLog is a fitness tracking application that allows users to log workouts, track exercises, and monitor personal records (PRs). In this project, we extend the existing MongoDB-backed GymLog system with a Redis in-memory layer to support fast access to personal record data and real-time leaderboard functionality.

### Redis Functionalities Selected

1. **Personal Records Cache** — Store each user's best lift per exercise as a Redis sorted set, enabling instant lookup without querying MongoDB.
2. **PR Leaderboard** — Rank users by their best weight for a given exercise across the entire user base.

These use cases benefit from Redis because:
- Personal records are read frequently and change infrequently
- Leaderboard queries require fast sorted access across many users
- In-memory storage eliminates latency from disk-based queries

---

## Conceptual Model (UML)

### Collections (from MongoDB / Project 2)

```
User
- _id
- username
- email
- created_at
- active
- personalRecords[]
    - exercise_name
    - max_weight
    - achieved_date

Workout
- _id
- user_id (ref: User)
- date
- notes
- sets[]
    - exercise_name
    - reps
    - weight

Exercise
- _id
- name
- category
- muscleGroups[]
    - name
    - isPrimary
```

### Redis Layer

```
Sorted Set: pr:<username>
  member  = exercise_name (string)
  score   = max_weight (float, kg)

Example keys:
  pr:mike_t     → { "Deadlift": 185 }
  pr:daniel_k   → { "Squat": 235, "Bench Press": 100 }
```

---

## Redis Data Structures

### Sorted Set: `pr:<username>`

A sorted set is used to store each user's personal records. The **member** is the exercise name and the **score** is the maximum weight lifted in kilograms.

**Why a sorted set?**
- Automatically keeps records sorted by weight
- O(log n) insert and update
- Supports range queries (e.g. top N exercises by weight)
- `ZREVRANGE` returns records from heaviest to lightest instantly

---

## Redis Commands (CRUD)

### Initialize
```
FLUSHALL
```

### CREATE — Seed a user's PR
```
ZADD pr:mike_t 185 "Deadlift"
ZADD pr:daniel_k 235 "Squat"
ZADD pr:daniel_k 100 "Bench Press"
```

### READ — Get all PRs for a user (sorted heaviest first)
```
ZREVRANGE pr:mike_t 0 -1 WITHSCORES
```

### READ — Get PR for a specific exercise
```
ZSCORE pr:mike_t "Deadlift"
```

### UPDATE — Set a new PR (only if heavier)
```
ZADD pr:mike_t 200 "Deadlift"
```

### DELETE — Remove a specific PR
```
ZREM pr:mike_t "Deadlift"
```

### DELETE — Remove all PRs for a user
```
DEL pr:mike_t
```

### LEADERBOARD — Get all users with a PR for a given exercise
```
ZSCORE pr:mike_t "Deadlift"
ZSCORE pr:daniel_k "Deadlift"
ZSCORE pr:alex_r "Deadlift"
... (repeat for each user, sort client-side)
```