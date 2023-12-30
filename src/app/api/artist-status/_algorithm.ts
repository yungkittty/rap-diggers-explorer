let actions = ["👍", "👎", "⛏️", "❌"];
let results = [];
for (let i = 0; i < 25; i++) {
  let result = [];
  for (let ii = 0; ii < Math.random() * 5 + 1; ii++) {
    result.push(actions[Math.floor(Math.random() * 4)]);
  }
  results.push(result);
}
// console.log(JSON.stringify(results,null,2));

const actions_ = [
  ["👍", "👍", "👍"],
  ["👍", "⛏️", "👎", "👎", "👍"],
  ["👎", "👍", "👎"],
  ["❌", "👍", "❌", "❌", "👍"],
  ["👍", "👎", "⛏️", "⛏️", "⛏️"],
  ["👎", "⛏️"],
  ["👎", "❌"],
  ["⛏️", "❌"],
  ["❌", "❌"],
  ["👍", "⛏️", "❌", "⛏️", "👍"],
  ["👎", "❌", "⛏️"],
  ["👍", "👎", "❌", "❌"],
  ["❌", "❌", "⛏️", "👎"],
  ["⛏️", "👎", "👍", "❌"],
  ["👎", "❌"],
  ["👎", "👍", "⛏️", "⛏️", "❌", "⛏️"],
  ["👍", "⛏️", "❌"],
  ["👍", "❌", "❌", "❌", "👍"],
  ["⛏️", "👎", "⛏️", "👎"],
  ["⛏️", "👎"],
  ["❌", "❌"],
  ["👍", "👍", "⛏️"],
  ["👎", "👎", "❌", "❌"],
  ["👎", "⛏️", "❌"],
];

actions_.sort((leftActions, rightActions) => {
  const leftActionsLikeRatio =
    leftActions.filter((a) => a === "👍").length / leftActions.length;
  const leftActionsDislikeRatio =
    leftActions.filter((a) => a === "👎").length / leftActions.length;
  const leftActionsDigInRatio =
    leftActions.filter((a) => a === "⛏️").length / leftActions.length;
  const leftActionsDigOutRatio =
    leftActions.filter((a) => a === "❌").length / leftActions.length;

  const rightActionsLikeRatio =
    rightActions.filter((a) => a === "👍").length / rightActions.length;
  const rightActionsDislikeRatio =
    rightActions.filter((a) => a === "👎").length / rightActions.length;
  const rightActionsDigInRatio =
    rightActions.filter((a) => a === "⛏️").length / rightActions.length;
  const rightActionsDigOutRatio =
    rightActions.filter((a) => a === "❌").length / rightActions.length;

  const computeScore = (
    likeRatio: number,
    dislikeRatio: number,
    digInRation: number,
    digOutRatio: number,
  ): number =>
    (digInRation * +1.5 +
      likeRatio * +5 +
      // snooze
      dislikeRatio * -1.5 +
      digOutRatio * -8) /
    4;

  const leftScore = computeScore(
    leftActionsLikeRatio,
    leftActionsDislikeRatio,
    leftActionsDigInRatio,
    leftActionsDigOutRatio,
  );
  const rightScore = computeScore(
    rightActionsLikeRatio,
    rightActionsDislikeRatio,
    rightActionsDigInRatio,
    rightActionsDigOutRatio,
  );

  return leftScore - rightScore;
});
// console.log(JSON.stringify(actions_.reverse(), null, 2));
