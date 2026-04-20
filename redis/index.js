const { MongoClient } = require("mongodb");
const redis = require("redis");

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "gymlog";

// ─── Clients ────────────────────────────────────────────────────────────────
const mongo = new MongoClient(MONGO_URI);
const redisClient = redis.createClient();

// ─── Helper ─────────────────────────────────────────────────────────────────
function prKey(userId) {
  return `pr:${userId}`;
}

// ─── CREATE: Seed PRs from MongoDB into Redis ────────────────────────────────
async function seedPersonalRecords() {
  console.log("\n=== SEED: Loading personal records from MongoDB → Redis ===");
  const users = await mongo.db(DB_NAME).collection("users").find({}).toArray();

  for (const user of users) {
    const key = prKey(user.username);
    await redisClient.del(key);

    if (user.personalRecords && user.personalRecords.length > 0) {
      for (const pr of user.personalRecords) {
        await redisClient.zAdd(key, {
          score: pr.max_weight,
          value: pr.exercise_name,
        });
      }
      console.log(`  Seeded ${user.personalRecords.length} PRs for @${user.username}`);
    }
  }
}

// ─── READ: Get all PRs for a user (sorted by weight desc) ───────────────────
async function getPersonalRecords(username) {
  console.log(`\n=== READ: Personal Records for @${username} ===`);
  const key = prKey(username);
  const records = await redisClient.zRangeWithScores(key, 0, -1, { REV: true });

  if (records.length === 0) {
    console.log("  No records found.");
  } else {
    records.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.value} — ${r.score} kg`);
    });
  }
}

// ─── UPDATE: Set or update a PR for a user ──────────────────────────────────
async function setPersonalRecord(username, exerciseName, weightKg) {
  console.log(`\n=== UPDATE: Setting PR for @${username} — ${exerciseName}: ${weightKg} kg ===`);
  const key = prKey(username);

  const existing = await redisClient.zScore(key, exerciseName);
  if (existing !== null && existing >= weightKg) {
    console.log(`  No update — existing PR (${existing} kg) is already >= ${weightKg} kg`);
    return;
  }

  await redisClient.zAdd(key, { score: weightKg, value: exerciseName });
  console.log(`  PR updated: ${exerciseName} → ${weightKg} kg`);
}

// ─── DELETE: Remove a specific PR for a user ────────────────────────────────
async function deletePersonalRecord(username, exerciseName) {
  console.log(`\n=== DELETE: Removing PR for @${username} — ${exerciseName} ===`);
  const key = prKey(username);
  const removed = await redisClient.zRem(key, exerciseName);

  if (removed === 0) {
    console.log(`  No PR found for ${exerciseName}`);
  } else {
    console.log(`  Removed PR for ${exerciseName}`);
  }
}

// ─── BONUS READ: Top lifters across all users for a given exercise ───────────
async function getTopLifters(exerciseName) {
  console.log(`\n=== LEADERBOARD: Top lifters for ${exerciseName} ===`);
  const users = await mongo.db(DB_NAME).collection("users").find({}).toArray();

  const results = [];
  for (const user of users) {
    const key = prKey(user.username);
    const score = await redisClient.zScore(key, exerciseName);
    if (score !== null) {
      results.push({ username: user.username, weight: score });
    }
  }

  results.sort((a, b) => b.weight - a.weight);
  if (results.length === 0) {
    console.log("  No data found.");
  } else {
    results.forEach((r, i) => {
      console.log(`  ${i + 1}. @${r.username} — ${r.weight} kg`);
    });
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  await mongo.connect();
  await redisClient.connect();
  console.log("Connected to MongoDB and Redis.");

  // SEED from Mongo
  await seedPersonalRecords();

  // READ all PRs for a user
  await getPersonalRecords("mike_t");

  // UPDATE — set a new PR
  await setPersonalRecord("mike_t", "Deadlift", 200);

  // READ again to confirm update
  await getPersonalRecords("mike_t");

  // DELETE a PR
  await deletePersonalRecord("mike_t", "Deadlift");

  // READ again to confirm delete
  await getPersonalRecords("mike_t");

  // LEADERBOARD for an exercise
  await getTopLifters("Deadlift");

  await mongo.close();
  await redisClient.quit();
}

main().catch(console.error);