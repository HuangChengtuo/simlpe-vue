function h(tag, props, children) {
  return { tag, props, children };
}
const demo = h('div', { class: 'red' }, [
  h('h1', null, 'hello')
]);
const demo2 = h('div', { class: 'green' }, [
  h('h2', null, 'changed')
]);
function mount(vdom, container) {
  const element = document.createElement(vdom.tag);
  vdom.element = element;
  if (vdom.props) {
    for (const key in vdom.props) {
      const value = vdom.props[key];
      element.setAttribute(key, value);
    }
  }
  if (typeof vdom.children === 'string') {
    element.textContent = vdom.children;
  }
  else {
    vdom.children.forEach(child => {
      mount(child, element);
    });
  }
  container.appendChild(element);
}
mount(demo, document.getElementById('app'));
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
    if (typeof v2.children === 'string') {
      if (typeof v1.children === 'string') {
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
      if (typeof v1.children === 'string') {
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
patch(demo, demo2);
