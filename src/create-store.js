import isPlainObject from 'lodash/isPlainObject';

export default function createStore(reducer, initialState) {
  if (typeof reducer !== 'function') {
    throw new Error('Reducer must be a function.');
  }
  let state = reducer(initialState, { type: '@@reflux/INIT' });
  const subscribers = [];
  const store = {
    getState() { return state; },
    dispatch(action) {
      if (!isPlainObject(action)) {
        throw new Error('Action must be a plain object.');
      }
      state = reducer(state, action);
      const clonedSubscribers = subscribers.slice(0);
      clonedSubscribers.forEach((subscriber) => {
        subscriber.call(undefined);
      });
    },
    subscribe(subscriber) {
      subscribers.push(subscriber);
      let unsubstriberCalled = false;
      return () => {
        if (unsubstriberCalled) {
          return;
        }
        unsubstriberCalled = true;
        if (subscribers.indexOf(subscriber) !== -1) {
          subscribers.splice(
            subscribers.indexOf(subscriber),
            1
          );
        }
      };
    }
  };
  return store;
}
