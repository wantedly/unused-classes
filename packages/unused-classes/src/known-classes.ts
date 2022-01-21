export type Options = {
  known?: string[];
};

export function parse(text: string, options: Options = {}): string[] {
  const { known = [] } = options;
  return known.filter((className) => {
    if (className.startsWith(".") || className.startsWith("#")) {
      const truncName = className.substring(1);
      return text.includes(truncName);
    } else {
      return false;
    }
  });
}
