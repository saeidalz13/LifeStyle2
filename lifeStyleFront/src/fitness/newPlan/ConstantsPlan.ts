let MOVESARRAY = [
  // Chest
  "Chest: Bench Press BB",
  "Chest: Upper Press BB",
  "Chest: Bench Press DB",
  "Chest: Machine Press",
  "Chest: Upper Press DB",
  "Chest: Upper Machine Press",

  // Legs
  "Legs: Squats",
  "Legs: Bulgarian Squats",
  "Legs: Leg Press",
  "Legs: Hack Squats",
  "Legs: Calves",
  "Legs: Hip Thrust",

  // Shoulder
  "Shoulder: Arnold Press",
  "Shoulder: Military Press",
  "Shoulder: Shoulder Press DB",
  "Shoulder: Lateral Raise DB",
  "Shoulder: Lateral Raise Cable",
  
  // Back
  "Back: Pull Ups",
  "Back: Chin Ups",
  "Back: Lat Pulldown",
  "Back: Seated Inclined DB",
  "Back: Row Cable Seated",
  "Back: Row Cable Single",

  // Arms
  "Biceps: Curl DB",
  "Biceps: Curl Inclined DB",
  "Biceps: Curl BB",
  "Biceps: Hammer Curl",
  "Triceps: Extenstion DB",
  "Triceps: Pulldown Cable",
];
MOVESARRAY = MOVESARRAY.sort();

const SETSREPS = [];
for (let i = 1; i <= 30; i++) {
  SETSREPS.push(i);
}

export default {
  MOVESARRAY,
  SETSREPS,
};
