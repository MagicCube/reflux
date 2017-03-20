export default function combineReducer(reducerMap) {
  const keys = Object.keys(reducerMap);
  return (state, action) => {
    const newState = {};
    keys.forEach((key) => {
      newState[key] = reducerMap[key](state[key], action);
    });
    return newState;
  };
}
