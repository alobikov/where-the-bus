export default class RestApi {
  constructor(url = "http://localhost:9001") {
    if (!!RestApi.instance) return RestApi.instance;
    RestApi.instance = this;
    this.url = url;
    return this;
  }
  getUrl() {
    return this.url;
  }

  fetchRoutes() {
    try {
      return fetch(this.url + "/routes").then((response) => response.json());
    } catch (error) {
      console.error(`Problem fetching Routes List from ${this.url}`, error);
      return;
    }
  }

  fetchTrips() {
    try {
      return fetch(this.url + "/trips").then((response) => response.json());
    } catch (error) {
      console.error(`Problem fetching Trips List from ${this.url}`, error);
      return;
    }
  }
}
