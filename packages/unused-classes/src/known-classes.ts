export type Options = {
  known_classes?: string[];
  known_ids?: string[];
};

export function parse(text: string, options: Options = {}): string[] {
  const { known_classes: knownClasses = [], known_ids: knownIds = [] } = options;
  const classNames = knownClasses.filter((className) => text.includes(className)).map((className) => `.${className}`);
  const ids = knownIds.filter((id) => text.includes(id)).map((id) => `#${id}`);
  return classNames.concat(ids);
}
