import axios from "axios";
import { IBusRoutes, ITripCollection } from "./../types/types";
import Trip from "../components/trip";

// convert string 25256398 to 25.256398
export const gpsFormat = (x: string): number => {
  return parseFloat(x.slice(0, 2) + "." + x.slice(2));
};

export const mockAll = (): IBusRoutes => {
  return {
    bus: ["1", "2", "3", "3G"],
    tbus: ["10", "13", "17"],
  };
};

async function fetchAll() {
  const response = await axios("https://www.stops.lt/vilnius/gps_full.txt");
  const byLines: string[] = response.data.split("\n");
  const data = [];
  byLines.forEach((line: string) => {
    const [type, title, id, , lng, lat, rest] = line.split(",");
    if (id === "ReisoID" || id === "" || !id) {
      return;
    } // filter the crap
    data.push({
      id,
      type: type === "Autobusai" ? "bus" : "tbus",
      title,
      lngLat: [gpsFormat(lng), gpsFormat(lat)],
    });
  });
  //   console.log("fetchAll", data);
  return data;
}

export default { mockAll, fetchAll };

// prom() {
//     return new Promise((resolve) => setTimeout(() => resolve("done"), 3000));
//   }
