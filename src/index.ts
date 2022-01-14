import glob from "glob";
import fs from "node:fs";
import { promisify } from "node:util";
import { parse as parseHaml } from "./haml";
import { parse as parseErb } from "./erb";

(async () => {
  // TODO: make it configurable.
  // Use ln -s path/to/repo repo now
  const files = await promisify(glob)("./repo/app/**/*", { nodir: true });
  const classNames = new Set<string>();
  for (const filename of files) {
    let result: string[];
    if (/\.haml$/.test(filename)) {
      result = parseHaml(await fs.promises.readFile(filename, { encoding: "utf-8" }));
    } else if (/\.html\.erb$/.test(filename)) {
      result = parseErb(await fs.promises.readFile(filename, { encoding: "utf-8" }));
    } else {
      continue;
    }
    for (const className of result) {
      classNames.add(className);
    }
  }
  const result = {
    class_names: Array.from(classNames.values()).sort(),
  };
  await fs.promises.writeFile("./repo/tmp/classes.json", JSON.stringify(result));
})();
