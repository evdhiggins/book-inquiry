class StoreModule {
  constructor(storeFunctions, ...args) {
    // update the module's state in StoreRoot
    this.__set = storeFunctions.setter;

    // provide method for accessing StoreRoot state
    this.rootGet = storeFunctions.rootGetter;

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
   * Return a copy of StoreModule state
   */
  get() {
    return Object.assign({}, this.__state);
  }

  /**
   * Similar usage to Svelte's `set` function. Updates StoreModule state for all values contained
   * within `newState`, but doesn't change any excluded state values
   *
   * Unlike Svelte's `set`, `StoreModule.set` still triggers a refresh of all StoreModule values and
   * computed functions
   * @param {{[index: string]: any}} newState
   */
  set(newState) {
    if (Array.isArray(newState) || newState === null || typeof newState !== 'object') {
      throw new TypeError('`newState` in StoreModule.set must be an object');
    }
    Object.entries(newState).forEach(([key, value]) => {
      if (this.__computed.hasOwnProperty(key)) {
        throw new Error(`Cannot manualy set computed value "${key}"`);
      }
      if (typeof this.__state[key] !== 'undefined') {
        this.__state[key] = value;
      } else {
        this.__addStateProp(key, value, true);
      }
    });
    this.__refreshState();
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
   * Trigger compute functions & update StoreRoot state
   */
  __refreshState() {
    this.__refreshComputed();
    this.__set(this.__state);
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
      this.__addStateProp(key, value, true);
    });
    this.__refreshState();
  }

  /**
   * Adds a state property to the module state. All module state properties trigger a StoreRoot
   * state update when changed.
   * @param {string} propName
   * @param {any} propValue
   */
  __addStateProp(propName, propValue, skipRefresh = false) {
    if (typeof propName !== 'string') {
      throw new TypeError(`StoreModule state error: "${propName}" is not a string`);
    }
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
          this.__refreshState();
        },
      });
    }
    if (!skipRefresh) {
      this.__refreshState();
    }
  }
}

module.exports = { StoreModule };
