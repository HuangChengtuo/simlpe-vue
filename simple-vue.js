// render, vdom part
function h(tag, props, children) {
    return { tag, props, children };
}
function mount(vdom, container) {
    const element = document.createElement(vdom.tag);
    vdom.element = element;
    if (vdom.props) {
        for (const key in vdom.props) {
            const value = vdom.props[key];
            if (key.startsWith('on')) {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            }
            else {
                element.setAttribute(key, value);
            }
        }
    }
    if (Array.isArray(vdom.children)) {
        vdom.children.forEach(child => {
            mount(child, element);
        });
    }
    else {
        element.textContent = vdom.children;
    }
    container.appendChild(element);
}
// v1:old,v2:new
function patch(v1, v2) {
    const patchElement = v2.element = v1.element;
    if (v1.tag === v2.tag) {
        // change attr
        for (const key in v2?.props) {
            const oldValue = v1?.props?.[key];
            const newValue = v2?.props?.[key];
            if (newValue !== oldValue) {
                patchElement.setAttribute(key, newValue);
            }
        }
        // remove attr
        for (const key in v1?.props) {
            if (!(key in v1.props)) {
                patchElement.removeAttribute(key);
            }
        }
        // both children string
        if (!Array.isArray(v2.children)) {
            if (!Array.isArray(v1.children)) {
                if (v1.children !== v2.children) {
                    patchElement.textContent = v2.children;
                }
            }
            else {
                patchElement.textContent = v2.children;
            }
        }
        else {
            // new children is array,old children is string
            if (!Array.isArray(v1.children)) {
                patchElement.innerHTML = '';
                v2.children.forEach(child => {
                    mount(child, patchElement);
                });
            }
            else {
                // both children is array
                const commonLength = Math.min(v1.children.length, v2.children.length);
                // deal with commonPart
                for (let i = 0; i < commonLength; i++) {
                    patch(v1.children[i], v2.children[i]);
                }
                // add children
                if (v2.children.length > v1.children.length) {
                    v2.children.slice(v1.children.length).forEach(child => {
                        mount(child, patchElement);
                    });
                }
                else {
                    // remove children
                    v1.children.slice(v2.children.length).forEach(child => {
                        patchElement.removeChild(child.element);
                    });
                }
            }
        }
    }
    else {
        // complex replace...
    }
}
// reactive part
let activeEffect = null;
class Dep {
    constructor() {
        this.subscribers = new Set();
    }
    depend() {
        if (activeEffect) {
            this.subscribers.add(activeEffect);
        }
    }
    notify() {
        this.subscribers.forEach(effect => {
            effect();
        });
    }
}
function watchEffect(effect) {
    activeEffect = effect;
    effect();
    activeEffect = null;
}
// let target can be auto garbage collected
const targetMap = new WeakMap();
function getDep(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    // first time access key
    if (!dep) {
        dep = new Dep();
        depsMap.set(key, dep);
    }
    return dep;
}
const reactiveHandler = {
    get(target, key, receiver) {
        const dep = getDep(target, key);
        dep.depend();
        // make prototype work normally
        return Reflect.get(target, key, receiver);
    },
    set(target, key, receiver) {
        const dep = getDep(target, key);
        const result = Reflect.set(target, key, receiver);
        dep.notify();
        return result;
    }
};
function reactive(raw) {
    // Vue 3
    return new Proxy(raw, reactiveHandler);
    // in Vue 2, can't detect new prop
    // Object.keys(raw).forEach(key => {
    //   let value = raw[key]
    //   const dep = new Dep()
    //
    //   Object.defineProperty(raw, key, {
    //     get() {
    //       dep.depend()
    //       return value
    //     },
    //     set(newValue) {
    //       value = newValue
    //       dep.notify()
    //     }
    //   })
    // })
    // return raw
}
const App = {
    data: reactive({ count: 0 }),
    render() {
        return h('div', {
            onClick: () => {
                this.data.count++;
            }
        }, this.data.count);
    }
};
function createApp(component, container) {
    let isMounted = false;
    let oldVdom;
    watchEffect(() => {
        if (!isMounted) {
            oldVdom = component.render();
            mount(oldVdom, container);
            isMounted = true;
        }
        else {
            const newVdom = component.render();
            patch(oldVdom, newVdom);
            oldVdom = newVdom;
        }
    });
}
createApp(App, document.getElementById('app'));
