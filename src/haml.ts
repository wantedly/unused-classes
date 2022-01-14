const ATTR_REG = /\b(id|class)['"]?\s*(?::|=>)\s*('[^']*|"[^"]*)/g;

export function parse(text: string): string[] {
  const classNames: string[] = [];
  const lines = text.split("\n");

  // Haml notation (#id, .class)
  for (const line of lines) {
    const [_indent, tLine] = getIndent(line);

    switch (tLine.charAt(0)) {
      case '#':
        if (/[{@$]/.exec(tLine.charAt(1) ?? '')) {
          break;
        }
        // fallthrough
      case '%':
      case '.': {
        const [, _tagPart, classPart, _rest] = tLine.match(/(%[-:\w]*)?([-:\w.#\@]*)(.*)/)!;
        for (const classOrId of classPart.matchAll(/[.#][-:\w\@]*/g)) {
          classNames.push(classOrId[0]);
        }
        break;
      }
      default:
        break;
    }
  }

  // explicit class/id attrs, including ones used in helpers like link_to
  for (const match of text.matchAll(ATTR_REG)) {
    const prefix = match[1] === "class" ? "." : "#";
    const attrValue = stripAttrValue(match[2]);
    for (const part of attrValue.trim().split(/\s+/)) {
      classNames.push(`${prefix}${part}`);
    }
  }

  return classNames;
}

function getIndent(line: string): [string, string] {
  const pos = line.match(/^[ \t]*/)?.[0].length ?? 0;
  return [line.substring(0, pos), line.substring(pos).trimEnd()];
}

function stripAttrValue(text: string): string {
  if (text.startsWith("'")) {
    return text.substring(1, text.length);
  } if (text.startsWith("\"")) {
    return text.substring(1, text.length);
  }
  return text;
}
