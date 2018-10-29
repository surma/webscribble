const fs = require("fs");

const defaults = {
  manifestName: "entrypoint.hashmanifest.json"
};

export default function(opts = {}) {
  opts = Object.assign({}, defaults, opts);
  let inputs;
  return {
    name: "hash-manifest",
    options({ input }) {
      inputs = input;
      if (typeof inputs === "string") {
        inputs = [inputs];
      }
      if (typeof inputs === "object") {
        inputs = Object.values(inputs);
      }
    },
    generateBundle(_outputOptions, bundle) {
      let map = {};
      return Promise.all(inputs.map(id => this.resolveId(id))).then(
        resolvedInputs => {
          for (const key of Object.keys(bundle)) {
            const idx = resolvedInputs.findIndex(
              input => input in bundle[key].modules
            );
            if (idx !== -1) {
              map[inputs[idx]] = bundle[key].fileName;
            }
          }
          fs.writeFileSync(opts.manifestName, JSON.stringify(map, null, "  "));
        }
      );
    }
  };
}
