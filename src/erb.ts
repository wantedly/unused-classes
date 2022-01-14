const ATTR_REG = /\b(id|class)=('[^']*'?|"[^"]*"?|\w+)/g;
export function parse(text: string): string[] {
  const result: string[] = [];
  for (const match of text.matchAll(ATTR_REG)) {
    const prefix = match[1] === "class" ? "." : "#";
    const attrValue = stripAttrValue(match[2]);
    for (const part of attrValue.trim().split(/\s+/)) {
      result.push(`${prefix}${part}`);
    }
  }
  return result;
}

function stripAttrValue(text: string): string {
  if (text.startsWith("'") && text.endsWith("'")) {
    return text.substring(1, text.length - 1);
  } else if (text.startsWith("'")) {
    return text.substring(1, text.length);
  } else if (text.startsWith("\"") && text.endsWith("\"")) {
    return text.substring(1, text.length - 1);
  } else if (text.startsWith("\"")) {
    return text.substring(1, text.length);
  }
  return text;
}
