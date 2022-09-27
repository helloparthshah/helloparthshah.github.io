import { createStore } from "state-pool";

const store = createStore();
store.setState("pages", 1);

export default store;