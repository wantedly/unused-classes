export type Config = {
  rules?: Rule[] | undefined;
  externals?: Record<string, string[]>;
  output?: string | undefined;
};

export type Rule = {
  include: string[];
  exclude?: string[] | undefined;
  parser: string;
  options?: any;
};

class ConfigError extends Error {
  constructor(path: string, message?: string) {
    const reducedPath = path.replace(/^\$\./, "");
    super(reducedPath === "$" ? `Config error: ${message}` : `Config error: ${reducedPath}: ${message}`)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigError)
    }

    this.name = ConfigError.name
  }
}

export function validateConfig(obj: unknown, path = "$"): asserts obj is Config {
  validateObject(obj, path);
  validateKeys(obj, path, ["rules", "externals", "output"] as const);
  if (typeof obj.rules !== "undefined") {
    validateArray(obj.rules, `${path}.rules`, validateRule);
  }
  if (typeof obj.externals !== "undefined") {
    validateObject(obj.externals, `${path}.externals`);
    for (const [key, value] of Object.entries(obj.externals)) {
      validateArray(value, `${path}.externals[${JSON.stringify(key)}]`, validateString);
    }
  }
  if (typeof obj.output !== "undefined") {
    validateString(obj.output, `${path}.output`);
  }
}

export function validateRule(obj: unknown, path = "$"): asserts obj is Rule {
  if (typeof obj !== "object" || obj === null) throw new ConfigError(path, "not an object");
  validateKeys(obj, path, ["include", "exclude", "parser", "options"] as const);
  validateArray(obj.include, `${path}.include`, validateString);
  if (typeof obj.exclude !== "undefined") {
    validateArray(obj.exclude, `${path}.exclude`, validateString);
  }
  validateString(obj.parser, `${path}.parser`);
}

function validateObject(obj: unknown, path: string): asserts obj is object {
  if (typeof obj !== "object" || obj === null) throw new ConfigError(path, "not an object");
}

function validateString(obj: unknown, path: string): asserts obj is string {
  if (typeof obj !== "string") throw new ConfigError(path, "not a string");
}

function validateKeys<Keys extends readonly string[]>(obj: object, path: string, keys: Keys): asserts obj is Partial<Record<Keys[number], unknown>> {
  for (const key of Object.keys(obj)) {
    if (!keys.some((k) => k === key)) throw new ConfigError(path, `Unrecognized key: ${key}`);
  }
}

function validateArray<T>(obj: unknown, path: string, subValidator: (elem: unknown, path: string) => asserts elem is T): asserts obj is T[] {
  if (!Array.isArray(obj)) throw new ConfigError(path, "not an array");
  obj.forEach((elem, index) => {
    subValidator(elem, `${path}[${index}]`);
  });
}
