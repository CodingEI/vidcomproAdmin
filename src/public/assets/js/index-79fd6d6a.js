import {
  O as a,
  v as r,
  P as n,
  V as s,
  Y as c,
  a2 as i,
} from "./vendor-b2024301.js";
import { _ } from "./index-fbf0707b.js";
const l = { "aria-hidden": "true" },
  p = ["href", "fill"],
  d = a({
    __name: "index",
    props: {
      prefix: { type: String, default: "cms-icon" },
      name: { type: String, required: !0 },
      color: { type: String, default: "" },
      size: { type: String, default: "24px" },
    },
    setup(e) {
      const t = e,
        o = r(() => `#${t.prefix}-${t.name}`);
      return (f, u) => (
        n(),
        s(
          "span",
          { class: "cms-icon", style: i({ fontSize: e.size }) },
          [
            (n(),
            s("svg", l, [
              c("use", { href: o.value, fill: e.color }, null, 8, p),
            ])),
          ],
          4,
        )
      );
    },
  });
const y = _(d, [["__scopeId", "data-v-9e5455f6"]]);
export { y as _ };
