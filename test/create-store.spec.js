import { createStore } from '../index.js';

import { addTodo, dispatchInMiddle, throwError, unknownAction } from './helpers/actionCreators';
import * as reducers from './helpers/reducers';

describe('createStore', () => {
  it('expose the public APIs', () => {
    const store = createStore(() => {});
    const methods = Object.keys(store);
    expect(methods.length).toBe(3);
    expect(methods).toContain('dispatch');
    expect(methods).toContain('getState');
    expect(methods).toContain('subscribe');
  });

  it('throws if reducer is not a function', () => {
    expect(() => {
      createStore();
    }).toThrow();

    expect(() => {
      createStore(null);
    }).toThrow();

    expect(() => {
      createStore('test');
    }).toThrow();

    expect(() => {
      createStore({});
    }).toThrow();
  });

  it('passes the initial action and the initial state', () => {
    const store = createStore(reducers.todos, [
      {
        id: 1,
        text: 'Hello'
      }
    ]);
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ]);
  });

  it('applies the reducer to the previous state', () => {
    const store = createStore(reducers.todos);
    expect(store.getState()).toEqual([]);

    store.dispatch(unknownAction());
    expect(store.getState()).toEqual([]);

    store.dispatch(addTodo('Hello'));
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ]);

    store.dispatch(addTodo('World'));
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }, {
        id: 2,
        text: 'World'
      }
    ]);
  });

  it('applies the reducer to the initial state', () => {
    const store = createStore(reducers.todos, [
      {
        id: 1,
        text: 'Hello'
      }
    ]);
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ]);

    store.dispatch(unknownAction());
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ]);

    store.dispatch(addTodo('World'));
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }, {
        id: 2,
        text: 'World'
      }
    ]);
  });

  it('supports multiple subscriptions', () => {
    const store = createStore(reducers.todos);
    const listenerA = jest.fn();
    const listenerB = jest.fn();

    let unsubscribeA = store.subscribe(listenerA);
    store.dispatch(unknownAction());
    expect(listenerA.mock.calls.length).toBe(1);
    expect(listenerB.mock.calls.length).toBe(0);

    store.dispatch(unknownAction());
    expect(listenerA.mock.calls.length).toBe(2);
    expect(listenerB.mock.calls.length).toBe(0);

    const unsubscribeB = store.subscribe(listenerB);
    expect(listenerA.mock.calls.length).toBe(2);
    expect(listenerB.mock.calls.length).toBe(0);

    store.dispatch(unknownAction());
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(1);

    unsubscribeA();
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(1);

    store.dispatch(unknownAction());
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(2);

    unsubscribeB();
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(2);

    store.dispatch(unknownAction());
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(2);

    unsubscribeA = store.subscribe(listenerA);
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(2);

    store.dispatch(unknownAction());
    expect(listenerA.mock.calls.length).toBe(4);
    expect(listenerB.mock.calls.length).toBe(2);
  });

  it('only removes listener once when unsubscribe is called', () => {
    const store = createStore(reducers.todos);
    const listenerA = jest.fn();
    const listenerB = jest.fn();

    const unsubscribeA = store.subscribe(listenerA);
    store.subscribe(listenerB);

    unsubscribeA();
    unsubscribeA();

    store.dispatch(unknownAction());
    expect(listenerA.mock.calls.length).toBe(0);
    expect(listenerB.mock.calls.length).toBe(1);
  });

  it('only removes relevant listener when unsubscribe is called', () => {
    const store = createStore(reducers.todos);
    const listener = jest.fn();

    store.subscribe(listener);
    const unsubscribeSecond = store.subscribe(listener);

    unsubscribeSecond();
    unsubscribeSecond();

    store.dispatch(unknownAction());
    expect(listener.mock.calls.length).toBe(1);
  });

  it('supports removing a subscription within a subscription', () => {
    const store = createStore(reducers.todos);
    const listenerA = jest.fn();
    const listenerB = jest.fn();
    const listenerC = jest.fn();

    store.subscribe(listenerA);
    const unSubB = store.subscribe(() => {
      listenerB();
      unSubB();
    });
    store.subscribe(listenerC);

    store.dispatch(unknownAction());
    store.dispatch(unknownAction());

    expect(listenerA.mock.calls.length).toBe(2);
    expect(listenerB.mock.calls.length).toBe(1);
    expect(listenerC.mock.calls.length).toBe(2);
  });

  it('delays unsubscribe until the end of current dispatch', () => {
    const store = createStore(reducers.todos);

    const unsubscribeHandles = [];
    const doUnsubscribeAll = () => unsubscribeHandles.forEach(
      unsubscribe => unsubscribe()
    );

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();

    unsubscribeHandles.push(store.subscribe(() => listener1()));
    unsubscribeHandles.push(store.subscribe(() => {
      listener2();
      doUnsubscribeAll();
    }));
    unsubscribeHandles.push(store.subscribe(() => listener3()));

    store.dispatch(unknownAction());
    expect(listener1.mock.calls.length).toBe(1);
    expect(listener2.mock.calls.length).toBe(1);
    expect(listener3.mock.calls.length).toBe(1);

    store.dispatch(unknownAction());
    expect(listener1.mock.calls.length).toBe(1);
    expect(listener2.mock.calls.length).toBe(1);
    expect(listener3.mock.calls.length).toBe(1);
  });
});
