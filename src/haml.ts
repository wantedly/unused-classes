export function parse(text: string): string[] {
  const classNames: string[] = [];
  const lines = text.split("\n");
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
        const [, _tagPart, classPart, _rest] = line.match(/(%[-:\w]*)?([-:\w.#\@]*)(.*)/)!;
        for (const classOrId of classPart.matchAll(/[.#][-:\w\@]*/g)) {
          classNames.push(classOrId[0]);
        }
        break;
      }
      default:
        break;
    }
  }
  return classNames;
}

function getIndent(line: string): [string, string] {
  const pos = line.match(/^[ \t]*/)?.[0].length ?? 0;
  return [line.substring(0, pos), line.substring(pos).trimEnd()];
}
