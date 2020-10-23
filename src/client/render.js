import { selected, allTypeRoutes } from "./stock";
import { park } from "./park";

var routes = document.getElementById("routes");

const _showIds = () => {
  routes.innerHTML = "";
  const lst = document.createElement("div");
  lst.textContent = "ids will be shown here";
  lst.style.writingMode = "horizontal-tb";
  const ids = Object.keys(park.markersById);
  const html = ids
    .map((id) => `<div>${id}: ${park.busElmsById[id].title}</div>`)
    .join(" ");
  lst.innerHTML = html;
  routes.appendChild(lst);
};

const currierList = (carrier = "bus", emitSelected) => {
  routes.innerHTML = "";
  console.log("hey from makeList", carrier);
  //   console.log(selection[carrier]);
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

/// filter: 'all' | 'none'; comes from button name attribute
const filtered = (filter, carrier, emitSelected) => {
  if (filter === "none") selected[carrier] = [];
  else if (filter === "all") selected[carrier] = [...allTypeRoutes[carrier]];
  else if (filter === "markers") {
    _showIds();
    return;
  }
  // refresh display
  currierList(carrier, emitSelected);
};

export { currierList, filtered };
