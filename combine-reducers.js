export default function combineReducer(reducerMap) {
  const keys = Object.keys(reducerMap);
  return (state, action) => {
    const state = {};
    keys.forEach(key => {
      state[key] = reducerMap[key](state[key], action);
    });
    return state;
  }
}
