const CHEST_MOVES: Array<string> = [
  "Bench Press BB",
  "Incline Press BB",
  "Bench Press DB",
  "Machine Press",
  "Incline Press DB",
  "Incline Machine Press",
  "Dips",

];

const LEG_MOVES: Array<string> = [
  "Squats",
  "Bulgarian Split Squats",
  "Leg Press",
  "Leg Press Seated",
  "Hack Squats",
  "Calves",
  "Hip Thrust",
  "Leg Extension",
];

const SHOULDER_MOVES: Array<string> = [
  "Arnold Press",
  "Military Press",
  "Shoulder Press DB",
  "Lateral Raise DB",
  "Lateral Raise Cable",
];

const BACK_MOVES: Array<string> = [
  "Pull Ups",
  "Chin Ups",
  "Lat Pulldown",
  "Inclined DB Row",
  "Row Cable Seated",
  "Row Cable Single",
  "Shrugs DB",
];

const BICEPS_MOVES: Array<string> = [
  "Biceps Curl DB",
  "Biceps Seated Incline DB",
  "Biceps Curl BB",
  "Biceps Hammer Curl",
];

const TRICEPS_MOVES: Array<string> = ["Triceps Extenstion DB", "Triceps Pushdown Cable"];

const ABS_MOVES: Array<string> = ["Hanging Leg Raise", "Russian Twist", "Reverse Crunch"];

let MOVESARRAY: Array<string> = [
  ...CHEST_MOVES,
  ...LEG_MOVES,
  ...SHOULDER_MOVES,
  ...BACK_MOVES,
  ...BICEPS_MOVES,
  ...TRICEPS_MOVES,
  ...ABS_MOVES,
];

MOVESARRAY = MOVESARRAY.sort();

const SETSREPS = [];
for (let i = 1; i <= 30; i++) {
  SETSREPS.push(i);
}

const YOUTUBE_LINKS_MOVES: { [key: string]: string } = {
  // Chest
  "Bench Press BB":
    "https://www.youtube.com/embed/esQi683XR44?si=p8RRdx6WxYqBiLSx",
  "Incline Press BB":
    "https://www.youtube.com/embed/jPLdzuHckI8?si=FYtaONrwpMEBoYPw",
  "Bench Press DB":
    "https://www.youtube.com/embed/QsYre__-aro?si=4NzYStGfhGkw-Ap9",
  "Machine Press":
    "https://www.youtube.com/embed/xUm0BiZCWlQ?si=APFZyDKiciq6M068",
  "Incline Press DB":
    "https://www.youtube.com/embed/0f6-uCUKqgA?si=Wm9CFesdmV9SAYeE",
  "Incline Machine Press":
    "https://www.youtube.com/embed/ig0NyNlSce4?si=3CeW-C5jW_1uBDEI",

  // Shoulder
  "Arnold Press":
    "https://www.youtube.com/embed/3ml7BH7mNwQ?si=s6EcDL9a2031knGY",
  "Military Press":
    "https://www.youtube.com/embed/_RlRDWO2jfg?si=oVvldzoegHGI2nyW",
  "Shoulder Press DB":
    "https://www.youtube.com/embed/0JfYxMRsUCQ?si=kqWLWOIMIpc_eAml",
  "Lateral Raise DB":
    "https://www.youtube.com/embed/3VcKaXpzqRo?si=mJ3VrQD3JOPgW_Lh",
  "Lateral Raise Cable":
    "https://www.youtube.com/embed/PPrzBWZDOhA?si=jfU09fv2lHHdxlnD",

  // Legs
  Squats: "https://www.youtube.com/embed/t2b8UdqmlFs?si=RcU1esSH5fW-0Rv3",
  "Bulgarian Split Squats":
    "https://www.youtube.com/embed/hPlKPjohFS0?si=BAvUdWq3ABzBUVGK",
  "Leg Press": "https://www.youtube.com/embed/Gk8cCEQh-CE?si=Ewr1270Rn1p2jUBI",
  "Hack Squats":
    "https://www.youtube.com/embed/0tn5K9NlCfo?si=ggGNqyoRF4VdX4SE",
  Calves: "https://www.youtube.com/embed/-qsRtp_PbVM?si=cGs6mOHWL72cqfzU",
  "Hip Thrust": "https://www.youtube.com/embed/xDmFkJxPzeM?si=gTGkaLK-37XAf5KC",

  // Back
  "Lat Pulldown":
    "https://www.youtube.com/embed/SALxEARiMkw?si=5JB8KbAr6RStAx1r",
  "Pull Ups": "https://www.youtube.com/embed/eGo4IYlbE5g?si=WXiq65gW5I7SXVwU",
  "Chin Ups": "https://www.youtube.com/embed/GBcUcATb8RQ?si=ivSW5zpchEbU3EAk",
  "Inclined DB Row":
    "https://www.youtube.com/embed/2LxN3_3atps?si=b3cHetoIJFx4x-r5",
  "Row Cable Seated":
    "https://www.youtube.com/embed/GZbfZ033f74?si=jHvp7TpqnFDNx_jy",
  "Row Cable Single":
    "https://www.youtube.com/embed/CrylzZHfO1c?si=YZF_ZGpW9Bbg6MxU",

  // Biceps
  "Biceps Curl DB":
    "https://www.youtube.com/embed/sAq_ocpRh_I?si=fEB58p_PWgiASav-",
  "Biceps Seated Incline DB":
    "https://www.youtube.com/embed/soxrZlIl35U?si=72S44MSlxvgQmg5t",
  "Biceps Curl BB":
    "https://www.youtube.com/embed/QZEqB6wUPxQ?si=umBtqfUdlCf0hhHJ",
  "Biceps Hammer Curl":
    "https://www.youtube.com/embed/zC3nLlEvin4?si=0NRlfCY9iqM5z_Dq",

  // Triceps
  "Triceps Extenstion DB":
    "https://www.youtube.com/embed/VQofhP53Lco?si=t0LyarKXaWM5U4-k",
  "Triceps Pushdown Cable":
    "https://www.youtube.com/embed/2-LAMcpzODU?si=d2_JGL559fXqjw2H",

  // ABS
  "Hanging Leg Raise":
    "https://www.youtube.com/embed/Nw0LOKe3_l8?si=KQq2AKXvNsJOk1qd",
  "Russian Twist":
    "https://www.youtube.com/embed/wkD8rjkodUI?si=RDp3Zpy7XXI1wfj8",
  "Reverse Crunch":
    "https://www.youtube.com/embed/7rRWy7-Gokg?si=IlAiJKlO9ZqZ7CUT",
};

const WEEKS: Array<number> = [];
for (let i = 1; i <= 20; i++) {
  WEEKS.push(i);
}

const WEIGHTS: Array<number> = [];
for (let i = 5;  i <= 200; i+=5) {
  WEIGHTS.push(i)
}

const REPS: Array<number> = [];
for (let i = 1; i <= 30; i++) {
  REPS.push(i)
}

export default {
  MOVESARRAY,
  SETSREPS,
  YOUTUBE_LINKS_MOVES,
  WEEKS,
  WEIGHTS,
  REPS
};
