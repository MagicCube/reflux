import { createStore } from '../index.js';

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
      const store = createStore();
    }).toThrow();

    expect(() => {
      const store = createStore(null);
    }).toThrow();

    expect(() => {
      const store = createStore("test");
    }).toThrow();

    expect(() => {
      const store = createStore({});
    }).toThrow();
  });
});
