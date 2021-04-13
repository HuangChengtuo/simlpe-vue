let activeEffect = null;
class Dep {
    constructor(value) {
        this._value = value;
        this.subscribers = new Set();
    }
    get value() {
        this.depend();
        return this._value;
    }
    set value(newValue) {
        this._value = newValue;
        this.notify();
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
const ok = new Dep(true);
const msg = new Dep('hello');
watchEffect(() => {
    if (ok.value) {
        console.log(msg.value);
    }
}); // print value
msg.value = 'changed'; // print 'changed'
ok.value = false;
msg.value = `can't log`;
