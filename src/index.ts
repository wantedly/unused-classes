import glob from "glob";
import fs from "node:fs";
import { promisify } from "node:util";
import { parse } from "./haml";

(async () => {
  // TODO: make it configurable.
  // Use ln -s path/to/repo repo now
  const files = await promisify(glob)("./repo/app/**/*.haml");
  const classNames = new Set<string>();
  for (const filename of files) {
    const content = await fs.promises.readFile(filename, { encoding: "utf-8" });
    for (const className of parse(content)) {
      classNames.add(className);
    }
  }
  for (const className of Array.from(classNames.values()).sort()) {
    console.log(className);
  }
})();
