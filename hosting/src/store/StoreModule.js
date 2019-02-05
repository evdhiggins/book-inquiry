class StoreModule {
  constructor(storeFunctions, ...args) {
    // refreshes compute values & sets the module state in the StoreRoot
    this.set = (newState) => {
      this.__refreshComputed();
      storeFunctions.setter(newState);
    };

    // provide method for module to call functions in other store modules
    this.dispatch = storeFunctions.dispatch;

    // module state is tracked locally in __state, which is written to the module's
    // state object in StoreRoot each time a state property is updated
    this.__state = {};

    // computed module state functions are re-evaluated each time that a non-computed
    // state property is updated, just before updating the StoreRoot
    this.__computed = {};

    const initialState = this.oncreate(...args);
    this.__createInitialState(initialState);
  }

  /**
   * `oncreate` placeholder in the case that a module doesn't implement `oncreate`.
   */
  oncreate(initialState = {}) {
    return initialState;
  }

  /**
   * Re-evaluates all computed properties, and assigns the values to the module state.
   * __refreshComputed is called each time the state object is modified
   */
  __refreshComputed() {
    Object.entries(this.__computed).forEach(([key, computeFunc]) => {
      try {
        // create copy of state to stop computed functions from accidentally modifying moduleState
        const moduleState = Object.assign({}, this.__state);

        // reassign value without checking for change; it will always be re-set in StoreRoot
        this.__state[key] = computeFunc(moduleState);
      } catch (e) {
        console.warn(`Error thrown in computed value "${key}:"`);
        console.warn(e.message);
      }
    });
  }

  /**
   * Create module state from initialState object. Makes all module state accessible at the
   * module root level (this[key]).
   * @param {any} initialState
   */
  __createInitialState(initialState = {}) {
    if (Array.isArray(initialState) || initialState === null || typeof initialState !== 'object') {
      console.error("Store module error: `initialState` isn't an object:");
      console.error(initialState);
      return;
    }

    Object.entries(initialState).forEach(([key, value]) => {
      this.__addStateProp(key, value);
    });
  }

  /**
   * Adds a state property to the module state. All module state properties trigger a StoreRoot
   * state update when changed.
   * @param {string} propName
   * @param {any} propValue
   */
  __addStateProp(propName, propValue) {
    if (typeof propValue === 'function') {
      this.__computed[propName] = propValue;
      // assign compute functions an intial state value of `null`
      this.__state[propName] = null;
      Object.defineProperty(this, [propName], {
        get() {
          return this.__state[propName];
        },
        set() {
          console.error(`Cannot set value of computed property "${propName}"`);
        },
      });
    } else {
      this.__state[propName] = propValue;
      Object.defineProperty(this, [propName], {
        get() {
          return this.__state[propName];
        },
        set(v) {
          this.__state[propName] = v;
          this.set(this.__state);
        },
      });
    }
  }
}

module.exports = { StoreModule };
