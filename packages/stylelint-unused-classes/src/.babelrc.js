module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "14" }, modules: "commonjs" }],
    ["@babel/preset-typescript", { allowDeclareFields: true }],
  ],
};
