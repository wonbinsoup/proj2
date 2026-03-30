

// 1. Find all active exercises
db.exercises.find({ active: true }).pretty()

// 2. Workouts longer than 60 min OR have more than 3 sets
db.workouts.find({
  $or: [
    { duration_minutes: { $gt: 60 } },
    { "sets.3": { $exists: true } }
  ]
}).pretty()

// 3. Count workouts for daniel_k
db.workouts.countDocuments({ username: "daniel_k" })

// 4. Toggle active flag on Leg Press
db.exercises.updateOne(
  { name: "Leg Press" },
  [{ $set: { active: { $not: "$active" } } }]
)
db.exercises.findOne({ name: "Leg Press" }, { name: 1, active: 1 })

// 5. Total volume (weight x reps) per exercise
db.workouts.aggregate([
  { $unwind: "$sets" },
  {
    $group: {
      _id: "$sets.exercise_name",
      total_volume: { $sum: { $multiply: ["$sets.weight", "$sets.reps"] } },
      total_sets: { $sum: 1 }
    }
  },
  { $sort: { total_volume: -1 } }
])