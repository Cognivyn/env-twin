import { buildExampleContent } from "./init.js";

describe("init", () => {
  it("sanitizes values while preserving comments and exports", () => {
    expect(buildExampleContent("# config\nexport API_KEY=secret\nPORT=3000\n")).toBe(
      '# config\nexport API_KEY="input_api_key"\nPORT="input_port"\n',
    );
  });

  it("does not expose source values in generated content", () => {
    expect(buildExampleContent("TOKEN=super-secret")).not.toContain("super-secret");
  });
});
