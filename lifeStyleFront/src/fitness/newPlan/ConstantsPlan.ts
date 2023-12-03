const CHEST_MOVES = [
  "Bench Press BB",
  "Upper Press BB",
  "Bench Press DB",
  "Machine Press",
  "Upper Press DB",
  "Upper Machine Press",
];

const LEG_MOVES = [
  "Squats",
  "Bulgarian Squats",
  "Leg Press",
  "Hack Squats",
  "Calves",
  "Hip Thrust",
];

const SHOULDER_MOVES = [
  "Arnold Press",
  "Military Press",
  "Shoulder Press DB",
  "Lateral Raise DB",
  "Lateral Raise Cable",
];

const BACK_MOVES = [
  "Pull Ups",
  "Chin Ups",
  "Lat Pulldown",
  "Seated Inclined DB",
  "Row Cable Seated",
  "Row Cable Single",
];

const BICEPS_MOVES = [
  "Biceps Curl DB",
  "Biceps Curl Inclined DB",
  "Biceps Curl BB",
  "Biceps Hammer Curl",
];

const TRICEPS_MOVES = ["Triceps Extenstion DB", "Triceps Pulldown Cable"];

let MOVESARRAY = [
  ...CHEST_MOVES,
  ...LEG_MOVES,
  ...SHOULDER_MOVES,
  ...BACK_MOVES,
  ...BICEPS_MOVES,
  ...TRICEPS_MOVES,
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
