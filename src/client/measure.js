const { busElmsById } = require("./redux/reducers/all_reducers");

let state = {
  id: "id",
  title: "title",
  type: "type",
  id1: "id",
  title1: "title",
  type1: "type",
  prev: [
    [1, 2],
    [1, 2],
  ],
};
const newPrev = [
  [25.2525, 26.2626],
  [27.2727, 28.2828],
];
console.time("timer");
console.timeLog("timer");
for (let i = 0; i < 10000; i++) {
  //   state = { ...state, prev: newPrev };
  update();
}
console.timeEnd("timer");
console.log(state);

function update() {
  state = Object.assign({}, state, { prev: newPrev });
  return;
}
//..................................................................
const state = {
  allIds: ["1", "2", "3"],
  markersById: { 1: "one", 2: "two", 3: "three" },
  busElmsById: {
    1: { type: "bus", polyElm: "Object" },
    2: { type: "bus", polyElm: "Object" },
    3: { type: "bus", polyElm: "Object" },
  },
};

ids = [1, 2];
const state2 = Object.fromEntries(ids.map((id) => [id, state.busElmsById[id]]));

const state1 = {
  ...state,
  busElmsById: Object.fromEntries(
    Object.keys(state.busElmsById).map((key) => [
      key,
      { ...state.busElmsById[key], polyElm: "pelm obj" },
    ])
  ),
};
console.log(JSON.stringify(state2));
//..................................................................

const a = [1, 2, 3, 4];
const new_a = [2, 3, 4];
// in a find outdated
const diff = a.filter((n) => !new_a.includes(n));
console.log(diff);
