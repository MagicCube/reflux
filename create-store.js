export default function createStore(reducer, initialState = {}) {
  let state = initialState;
  const subscribers = [];
  const store = {
    getState() { return state; },
    dispatch(action) {
      state = reducer(state, action);
      const clonedSubscribers = subscribers.slice(0);
      clonedSubscribers.forEach(subscriber => {
        subscriber.call(store);
      })
    },
    subscribe(subscriber) {
      subscribers.push(subscriber);
      return () => {
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
