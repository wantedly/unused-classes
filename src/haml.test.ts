import { describe, expect, it } from "@jest/globals";
import { parse } from "./haml";

describe("parse", () => {
  it("parses HAML (basic)", () => {
    const result = parse(`
      #root
        %span#container.liquid{ ... }
          #{ I18n.t("greeting") }
        %a.btn.btn-primary()
    `);
    expect(result).toEqual(["#root", "#container", ".liquid", ".btn", ".btn-primary"]);
  });
});
