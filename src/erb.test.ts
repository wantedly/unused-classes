import { describe, expect, it } from "@jest/globals";
import { parse } from "./erb";

describe("parse", () => {
  it("parses HTML Erb (basic)", () => {
    const result = parse(`
      <div id="root">
        <span id='container' class=liquid></span>
        <a class="btn btn-primary"></a>
      </div>
    `);
    expect(result).toEqual(["#root", "#container", ".liquid", ".btn", ".btn-primary"]);
  });
});
