// unit tests for all helper methods

import {
  replaceAsterisksWithDots
} from "./index";

describe("replaceAsterisksWithDots() Tests", () => {
  it("replaces one asterisk", () => {
    expect(replaceAsterisksWithDots("abcd*1234")).toBe("abcd•1234");
  });
  it("replaces multiple asterisks", () => {
    expect(replaceAsterisksWithDots("*ab*cd*12*34*")).toBe("•ab•cd•12•34•");
  });
  it("doesn't modify string without an asterisk", () => {
    expect(replaceAsterisksWithDots("abcd1234")).toBe("abcd1234");
  });
});

