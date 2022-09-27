import { createStore } from "state-pool";

const store = createStore();
store.setState("pages", 2);

export default store;