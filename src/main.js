import p5 from "p5";
import sketchSource from "../sketch.js?raw";

const sketch = new Function(
    "p5",
    "bridge",
    "with (bridge) {\n" +
        sketchSource +
        "\nreturn { setup, draw, mousePressed, mouseDragged, mouseReleased, touchStarted, touchMoved, touchEnded, windowResized };\n}"
);

new p5((instance) => {
    const bound = new Map();
    const bridge = new Proxy(instance, {
        has() {
            return true;
        },
        get(target, prop) {
            if (prop === Symbol.unscopables) return undefined;
            if (prop === "p5") return p5;
            if (typeof prop === "string" && prop in target) {
                const value = target[prop];
                if (typeof value === "function") {
                    if (!bound.has(prop)) bound.set(prop, value.bind(target));
                    return bound.get(prop);
                }
                return value;
            }
            const value = globalThis[prop];
            if (typeof value === "function") return value.bind(globalThis);
            return value;
        }
    });

    const api = sketch(p5, bridge);
    instance.setup = api.setup;
    instance.draw = api.draw;
    instance.mousePressed = api.mousePressed;
    instance.mouseDragged = api.mouseDragged;
    instance.mouseReleased = api.mouseReleased;
    instance.touchStarted = api.touchStarted;
    instance.touchMoved = api.touchMoved;
    instance.touchEnded = api.touchEnded;
    instance.windowResized = api.windowResized;
});
