import glob from "glob";
import minimatch from "minimatch";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { program } from "commander";
import { cosmiconfig } from "cosmiconfig";
import { parse as parseHaml } from "./haml";
import { parse as parseErb } from "./erb";
import { parse as parseKnownClasses } from "./known-classes";
import { validateConfig } from "./config";

type Parser = (text: string, options?: any) => string[];
const parserMap: Record<string, Parser> = {
  haml: parseHaml,
  erb: parseErb,
  "known-classes": parseKnownClasses,
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
  if (!config) throw new Error("Config not found");
  validateConfig(config.config);

  const { rules = [], externals = {}, output = "classes.json" } = config.config;
  for (const rule of rules) {
    const { parser: parserName } = rule;
    if (!Object.prototype.hasOwnProperty.call(parserMap, parserName)) {
      throw new Error(`Unknown parser: ${parserName}`);
    }
  }

  const classNames = new Set<string>();
  for (const rule of rules) {
    const { include, exclude = [], parser: parserName, options } = rule;
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
      const result = parse(await fs.promises.readFile(filename, { encoding: "utf-8" }), options);
      for (const className of result) {
        classNames.add(className);
      }
    }
  }
  for (const externalNames of Object.values(externals)) {
    for (const externalName of externalNames) {
      if (!externalName.startsWith(".") && !externalName.startsWith("#"))
        throw new Error(`Not a class name or an id: ${externalName}`);
      classNames.add(externalName);
    }
  }
  const result = {
    class_names: Array.from(classNames.values()).sort(),
  };
  await fs.promises.writeFile(path.resolve(directory, output), JSON.stringify(result));
})();
