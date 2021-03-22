import { init } from "./js/directedGraph.js";
import { fetchData } from "./js/api.js"
import { toGraphInput } from "./js/transform.js";

init(toGraphInput(fetchData()));
