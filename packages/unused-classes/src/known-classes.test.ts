import { describe, expect, it } from "@jest/globals";
import { parse } from "./known-classes";

describe("parse", () => {
  it("detects known class names (basic)", () => {
    const result = parse(`
      {
        "classes": [
          "user-profile-email",
          "user-profile-phone",
          "user-profile-introduction"
        ],
        "ids": [
          "special-content-header"
        ],
      }
    `, {
      known: [".user-profile-email", ".user-profile-phone", ".user-profile-image", "#special-content-header"],
    });
    expect(result).toEqual([".user-profile-email", ".user-profile-phone", "#special-content-header"]);
  });
});

