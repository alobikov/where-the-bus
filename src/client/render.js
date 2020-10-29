import { selected, allTypeRoutes } from "./stock";

var routes = document.getElementById("routes");

const currierList = (carrier = "bus", emitSelected) => {
  routes.innerHTML = "";
  allTypeRoutes[carrier].forEach((title) => {
    const btn = document.createElement("div");
    btn.classList.add(carrier, "bus-button");
    selected[carrier].includes(String(title)) &&
      btn.classList.toggle("selected");
    btn.setAttribute("data-index", title);
    btn.textContent = title;
    btn.addEventListener("click", (e) => {
      const title = e.target.dataset.index;
      if (selected[carrier].includes(title)) {
        selected[carrier] = selected[carrier].filter((i) => i !== title);
      } else {
        selected[carrier].push(title);
      }
      e.target.classList.toggle("selected");
      emitSelected(selected);
    });
    routes.appendChild(btn);
  });
};

/// filter: 'all' | 'none'; assigned as button name attribute
const filtered = (filter, carrier, emitSelected) => {
  if (filter === "none") selected[carrier] = [];
  else if (filter === "all") selected[carrier] = [...allTypeRoutes[carrier]];
  // refresh display
  currierList(carrier, emitSelected);
};

export { currierList, filtered };
