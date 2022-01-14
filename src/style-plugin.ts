import stylelint from "stylelint";
import type * as PostCSS from "postcss";
import selectorParser, { Root as SelectorRoot, Selector, Identifier as IdentifierSelector, ClassName as ClassNameSelector } from "postcss-selector-parser";
import fs from "fs";

const ruleName = "unused-classes/unused-classes";
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: "Possibly unused classes or ids"
});

module.exports = stylelint.createPlugin(
  ruleName,
  function (classesFilePath: string) {
    const classesData = readClassesFile(classesFilePath);
    return function (root, result) {
      if (!classesData) return;
      const classSet = new Set(classesData.class_names);

      root.walkRules((rule) => {
        const selectorRoot = parseSelector(rule.selector, result, rule);
        if (isUnused(classSet, selectorRoot)) {
          const unused = collectUnused(classSet, selectorRoot);
          // Report against the whole rule
          stylelint.utils.report({
            ruleName,
            result,
            message: `Possibly unused ${describeUnused(unused)}: ${unused.join(", ")}`,
            node: rule,
          });
        } else {
          selectorRoot.walk((node) => {
            if (node.type !== "class" && node.type !== "id") return;
            if (isUnused(classSet, node)) {
              const unused = collectUnused(classSet, node);
              // Report against the selector
              stylelint.utils.report({
                ruleName,
                result,
                message: `Possibly unused ${describeUnused(unused)}: ${unused.join(", ")}`,
                node: rule,
                index: node.sourceIndex,
              });
            }
          });
        }
      });
    };
  }
);

module.exports.ruleName = ruleName;
module.exports.messages = messages;

function isUnused(classSet: Set<string>, node: SelectorRoot | Selector | IdentifierSelector | ClassNameSelector): boolean {
  switch (node.type) {
    case "root":
      return node.nodes.every((sel) => isUnused(classSet, sel));
    case "selector":
      return node.nodes.some((elem) => {
        if (elem.type === "class" || elem.type === "id") return isUnused(classSet, elem);
        return false;
      });
    case "class":
      return !classSet.has(`.${node.value}`);
    case "id":
      return !classSet.has(`#${node.value}`);
  }
  return false;
}

function collectUnused(classSet: Set<string>, node: SelectorRoot | Selector | IdentifierSelector | ClassNameSelector): string[] {
  switch (node.type) {
    case "root":
      return node.nodes.flatMap((sel) => collectUnused(classSet, sel));
    case "selector":
      return node.nodes.flatMap((elem) => {
        if (elem.type === "class" || elem.type === "id") return collectUnused(classSet, elem);
        return [];
      });
    case "class":
      return classSet.has(`.${node.value}`) ? [] : [`.${node.value}`];
    case "id":
      return classSet.has(`#${node.value}`) ? [] : [`#${node.value}`];
  }
  return [];
}

function describeUnused(selectors: string[]): string {
  const hasClasses = selectors.some((sel) => sel.startsWith("."));
  const hasIds = selectors.some((sel) => sel.startsWith("#"));
  return hasClasses && hasIds ? "classes and ids" : hasIds ? "ids" : "classes";
}

function parseSelector(selector: string, result: stylelint.PostcssResult, node: PostCSS.Node): SelectorRoot {
	try {
		return selectorParser().astSync(selector);
	} catch {
		result.warn('Cannot parse selector', { node, stylelintType: 'parseError' });
    return selectorParser().astSync("*"); // dummy
	}
};

type ClassesData = {
  class_names: string[],
}

function readClassesFile(path: string): ClassesData | undefined {
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
  } else {
    return undefined;
  }
}
