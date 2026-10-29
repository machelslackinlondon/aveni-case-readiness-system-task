import type {
  ArtifactCounts,
  ArtifactType,
  Rule,
} from "./types";

type RuleObject = Record<string, unknown>;

export class InvalidRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRuleError";
  }
}

function readRuleObject(value: unknown, label: string): RuleObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new InvalidRuleError(`${label} must be a JSON object.`);
  }

  return value as RuleObject;
}

function rejectUnsupportedFields(
  value: RuleObject,
  supportedFields: readonly string[],
  label: string,
) {
  const unsupportedFields = Object.keys(value).filter(
    (field) => !supportedFields.includes(field),
  );

  if (unsupportedFields.length > 0) {
    throw new InvalidRuleError(
      `${label} contains unsupported fields: ${unsupportedFields.join(", ")}.`,
    );
  }
}

function parseArtifactType(value: unknown, label: string): ArtifactType {
  if (value === "call" || value === "document" || value === "email") {
    return value;
  }

  throw new InvalidRuleError(
    `${label} must be one of: call, document, email.`,
  );
}

export function parseRule(value: unknown, label = "rule"): Rule {
  const rule = readRuleObject(value, label);

  if (rule.type === "countAtLeast") {
    rejectUnsupportedFields(
      rule,
      ["type", "artifactType", "count"],
      label,
    );

    if (
      typeof rule.count !== "number" ||
      !Number.isInteger(rule.count) ||
      rule.count < 1
    ) {
      throw new InvalidRuleError(
        `${label}.count must be a positive integer.`,
      );
    }

    return {
      type: "countAtLeast",
      artifactType: parseArtifactType(
        rule.artifactType,
        `${label}.artifactType`,
      ),
      count: rule.count,
    };
  }

  if (rule.type === "all" || rule.type === "any") {
    rejectUnsupportedFields(rule, ["type", "rules"], label);

    if (!Array.isArray(rule.rules)) {
      throw new InvalidRuleError(`${label}.rules must be an array.`);
    }

    return {
      type: rule.type,
      rules: rule.rules.map((nestedRule, index) =>
        parseRule(nestedRule, `${label}.rules[${index}]`),
      ),
    };
  }

  throw new InvalidRuleError(
    `${label}.type must be one of: countAtLeast, all, any.`,
  );
}

export function evaluateRule(rule: Rule, counts: ArtifactCounts): boolean {
  if (rule.type === "countAtLeast") {
    return counts[rule.artifactType] >= rule.count;
  }

  if (rule.type === "all") {
    return rule.rules.every((nestedRule) =>
      evaluateRule(nestedRule, counts),
    );
  }

  return rule.rules.some((nestedRule) => evaluateRule(nestedRule, counts));
}
