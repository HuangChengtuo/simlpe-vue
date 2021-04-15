# simple-vue

render.html 渲染函数  
deps.html 构建依赖，副作用函数  
reactive.html 使用 proxy 将数据变为响应式  
simple-vue.html 最终效果

## 简单总结

h 函数生成一个带有 tag props children 的 vdom 对象  
`h(tag: string, props: object, children: VDOM[] | string): VDOM`  

mounted 函数将 vdom 渲染进真实 dom 中  
`mount(vdom: VDOM, container: HTMLElement)`  

patch 函数对新旧 vdom 进行对比、替换  
`patch(v1: VDOM, v2: VDOM)`  

Dep 类型来建立依赖，进行副作用函数调用  

reactive 函数通过 proxy 来进行对象的拦截，生成响应式数据，在 proxy 中建立各属性的 Dep 依赖