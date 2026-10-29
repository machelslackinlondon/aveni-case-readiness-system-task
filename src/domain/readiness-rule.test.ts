import { evaluateRule, parseRule } from "./readiness-rule";

describe("parseRule", () => {
  it("parses nested all and any rules", () => {
    expect(
      parseRule({
        type: "all",
        rules: [
          {
            type: "countAtLeast",
            artifactType: "document",
            count: 2,
          },
          {
            type: "any",
            rules: [
              {
                type: "countAtLeast",
                artifactType: "call",
                count: 1,
              },
              {
                type: "countAtLeast",
                artifactType: "email",
                count: 1,
              },
            ],
          },
        ],
      }),
    ).toEqual({
      type: "all",
      rules: [
        {
          type: "countAtLeast",
          artifactType: "document",
          count: 2,
        },
        {
          type: "any",
          rules: [
            {
              type: "countAtLeast",
              artifactType: "call",
              count: 1,
            },
            {
              type: "countAtLeast",
              artifactType: "email",
              count: 1,
            },
          ],
        },
      ],
    });
  });

  it("rejects unsupported rule fields", () => {
    expect(() =>
      parseRule({
        type: "countAtLeast",
        artifactType: "call",
        count: 1,
        enabled: true,
      }),
    ).toThrow("rule contains unsupported fields: enabled.");
  });
});

describe("evaluateRule", () => {
  const rule = {
    type: "all" as const,
    rules: [
      {
        type: "countAtLeast" as const,
        artifactType: "document" as const,
        count: 2,
      },
      {
        type: "any" as const,
        rules: [
          {
            type: "countAtLeast" as const,
            artifactType: "call" as const,
            count: 1,
          },
          {
            type: "countAtLeast" as const,
            artifactType: "email" as const,
            count: 1,
          },
        ],
      },
    ],
  };

  it("evaluates nested all and any groups", () => {
    expect(
      evaluateRule(rule, {
        call: 0,
        document: 2,
        email: 1,
      }),
    ).toBe(true);
    expect(
      evaluateRule(rule, {
        call: 1,
        document: 1,
        email: 0,
      }),
    ).toBe(false);
    expect(
      evaluateRule(rule, {
        call: 0,
        document: 2,
        email: 0,
      }),
    ).toBe(false);
  });
});
