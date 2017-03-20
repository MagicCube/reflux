import isPlainObject from 'lodash/isPlainObject';

export default function combineReducer(reducerMap) {
  const keys = Object.keys(reducerMap).filter((key) => {
    const reducer = reducerMap[key];
    if (reducer === undefined) {
      console.error(`No reducer provided for key "${key}"`);
      return false;
    } else if (typeof reducer !== 'function') {
      return false;
    }
    return true;
  });
  return (state = {}, action) => {
    if (!isPlainObject(action)) {
      throw new Error('Action must be a plain object.');
    }
    if (action.type === undefined) {
      throw new Error('Actions may not have an undefined "type" property');
    }
    const newState = {};
    keys.forEach((key) => {
      const reducer = reducerMap[key];
      const result = reducer(state[key], action);
      if (result === undefined) {
        throw new Error(`The result of action "${action.type}" from reducer "${key}" is undefined.`);
      }
      newState[key] = result;
    });
    return newState;
  };
}
