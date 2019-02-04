import { Store } from 'svelte/store';
import { StoreModule as StoreModuleClass } from './StoreModule';

export default class StoreRoot extends Store {
  constructor(state) {
    super(state);
    this._dispatchTriggers = {};
  }

  /**
   * Add a store module to the root store instance
   * @param {string} moduleName The name of the module, used for namespacing
   * @param {StoreModuleClass} ModuleClass A new-able reference to the module class
   * @param {...any} args Any additional arguments that need to be passed to the module
   * upon instantiation
   */
  addModule(moduleName, ModuleClass, ...args) {
    const storeName = `_${moduleName}Store`;
    if (this[storeName]) {
      console.warn(`addModule error: class property "${moduleName}" already exists.`);
      return;
    }
    const stateName = `${moduleName}State`;
    if (!this.get()[stateName]) {
      this.set({ [stateName]: {} });
    }
    const storeFunctions = {
      getter: () => this.get()[stateName],
      setter: state => this.set({ [stateName]: state }),
      dispatch: this.dispatch,
      rootGetter: this.get,
    };
    this[storeName] = new ModuleClass(storeFunctions, ...args);
  }

  /**
   * Call a function within the store root or any store modules
   * @param {string} action The name of the function, or the name of a module
   * & its function separated by a forward slash
   * @param {...any} args Any arguments to pass to the dispatched function
   */
  dispatch(action, ...args) {
    let actionFunction; // the function to be dispatched
    let actionContext; // the `this` context for the dispatch function

    try {
      if (/\//.test(action)) {
        // the action is for a module function
        const [moduleName, actionName] = action.split('/', 2);
        const storeModule = this[`_${moduleName}Store`];
        if (!(storeModule instanceof StoreModuleClass)) {
          throw new Error(`Dispatch error: module "${moduleName} not found."`);
        }
        actionFunction = storeModule[actionName];
        actionContext = storeModule;
      } else {
        // the action is a rootStore function
        actionFunction = this[action];
        actionContext = this;
      }
      if (typeof actionFunction !== 'function') {
        throw new Error(`Dispatch error: action "${action}" is not a function.`);
      }
      actionFunction = actionFunction.bind(actionContext);
    } catch (e) {
      console.warn(e.message);
      return null;
    }
    if (Array.isArray(this._dispatchTriggers[action])) {
      // call any trigger functions after `dispatch` returns
      setTimeout(() => {
        this._dispatchTriggers[action].forEach((fn) => {
          try {
            fn(...args);
          } catch (e) {
            console.error(`Dispatch trigger error: "${action}" trigger threw an error:`);
            console.error(e.message);
          }
        });
      }, 0);
    }
    return actionFunction(...args);
  }

  /**
   * Add a function that will be called after a given action is dispatched. The triggered
   * function will be triggered after `dispatch` returns, but it will not wait for any
   * asynchronous dispatch actions to resolve.
   * @param {string} action The name of the triggering action
   * @param {function|string} triggerFunction The trigger function. If `fn` is a string it
   * will be called via `StoreRoot.dispatch`
   */
  addDispatchTrigger(action, triggerFunction) {
    if (!Array.isArray(this._dispatchTriggers[action])) {
      this._dispatchTriggers[action] = [];
    }
    if (typeof triggerFunction === 'string') {
      const dispatchFunction = (...args) => this.dispatch(triggerFunction, ...args);
      this._dispatchTriggers[action].push(dispatchFunction);
    } else {
      this._dispatchTriggers[action].push(triggerFunction);
    }
  }
}
