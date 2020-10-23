let lst = Array.from(Array(54).keys());
lst.shift();
const busRoutes = lst.map((i) => i.toString());

lst = Array.from(Array(21).keys());
lst.shift();
const tbusRoutes = lst.map((i) => i.toString());

export const selected = { bus: ["all"], tbus: ["all"] };
export let allTypeRoutes = { bus: busRoutes, tbus: tbusRoutes };
export const setStock = (stock) => {
  allTypeRoutes = { ...stock };
  if (selected.bus.includes("all")) selected.bus = allTypeRoutes.bus;
  if (selected.tbus.includes("all")) selected.tbus = allTypeRoutes.tbus;
};

function init() {}
