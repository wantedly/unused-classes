import glob from "glob";
import minimatch from "minimatch";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { program } from "commander";
import { cosmiconfig } from "cosmiconfig";
import { parse as parseHaml } from "./haml";
import { parse as parseErb } from "./erb";
import { validateConfig } from "./config";

type Parser = (text: string) => string[];
const parserMap: Record<string, Parser> = {
  haml: parseHaml,
  erb: parseErb,
};

program.version("0.1.0");
program.name("unused-classes");

program.option("-d, --directory <dir>", "the project directory");

program.parse(process.argv);
const opts = program.opts();

(async () => {
  const { directory = "." } = opts;
  const explorer = cosmiconfig("classnames");
  const config = await explorer.search(directory);
  if (!config.config) throw new Error("Config not found");
  validateConfig(config.config);

  const { rules = [], output = "classes.json" } = config.config;
  for (const rule of rules) {
    const { parser: parserName } = rule;
    if (!Object.prototype.hasOwnProperty.call(parserMap, parserName)) {
      throw new Error(`Unknown parser: ${parserName}`);
    }
  }

  const classNames = new Set<string>();
  for (const rule of rules) {
    const { include, exclude = [], parser: parserName } = rule;
    const parse = parserMap[parserName];
    const files: string[] = [];
    for (const includeRule of include) {
      const subFiles = await promisify(glob)(path.resolve(directory, includeRule), { nodir: true });
      files.push(...subFiles);
    }
    const filteredFiles = files.filter((file) => {
      return exclude.every((excludeRule) => minimatch(file, excludeRule))
    });
    for (const filename of filteredFiles) {
      const result = parse(await fs.promises.readFile(filename, { encoding: "utf-8" }));
      for (const className of result) {
        classNames.add(className);
      }
    }
  }
  const result = {
    class_names: Array.from(classNames.values()).sort(),
  };
  await fs.promises.writeFile(path.resolve(directory, output), JSON.stringify(result));
})();
