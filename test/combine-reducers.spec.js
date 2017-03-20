import { createStore, combineReducers } from '../index.js';

describe('Utils', () => {
  describe('combineReducers', () => {
    it('returns a composite reducer that maps the state keys to given reducers', () => {
      const reducer = combineReducers({
        counter: (state = 0, action) => (action.type === 'increment' ? state + 1 : state),
        stack: (state = [], action) => (action.type === 'push' ? [...state, action.value] : state)
      });

      const s1 = reducer({}, { type: 'increment' });
      expect(s1).toEqual({ counter: 1, stack: [] });
      const s2 = reducer(s1, { type: 'push', value: 'a' });
      expect(s2).toEqual({ counter: 1, stack: ['a'] });
    });

    it('ignores all props which are not a function', () => {
      const reducer = combineReducers({
        fake: true,
        broken: 'string',
        another: { nested: 'object' },
        stack: (state = []) => state
      });

      expect(
        Object.keys(reducer({}, { type: 'push' }))
      ).toEqual(['stack']);
    });

    it('warns if a reducer prop is undefined', () => {
      const preSpy = console.error;
      const spy = jest.fn();
      console.error = spy;

      let isNotDefined;
      combineReducers({ isNotDefined });
      expect(spy.mock.calls[0][0]).toMatch(
        /No reducer provided for key "isNotDefined"/
      );

      spy.mockClear();
      combineReducers({ thing: undefined });
      expect(spy.mock.calls[0][0]).toMatch(
        /No reducer provided for key "thing"/
      );

      spy.mockClear();
      console.error = preSpy;
    });

    it('throws an error if a reducer returns undefined handling an action', () => {
      const reducer = combineReducers({
        counter(state = 0, action) {
          switch (action && action.type) {
            case 'increment':
              return state + 1;
            case 'decrement':
              return state - 1;
            case 'whatever':
            case null:
            case undefined:
              return undefined;
            default:
              return state;
          }
        }
      });

      expect(
        () => reducer({ counter: 0 }, { type: 'whatever' })
      ).toThrow(/"whatever".*"counter"/);
      expect(
        () => reducer({ counter: 0 }, null)
      ).toThrow(/Action must be a plain object./);
      expect(
        () => reducer({ counter: 0 }, {})
      ).toThrow(/Actions may not have an undefined "type" property/);
    });

    it('throws an error on first call if a reducer returns undefined initializing', () => {
      const reducer = combineReducers({
        counter(state, action) {
          switch (action.type) {
            case 'increment':
              return state + 1;
            case 'decrement':
              return state - 1;
            default:
              return state;
          }
        }
      });
      expect(() => reducer({ })).toThrow();
    });
  });
});
