import type {
  Artifact,
  ArtifactType,
  CaseState,
  Rule,
  Tenant,
} from "../domain/types";
import { ApiError } from "./api-error";

type JsonObject = Record<string, unknown>;

function validationError(message: string): never {
  throw new ApiError(400, "VALIDATION_ERROR", message);
}

export function readObject(
  value: unknown,
  label = "Request body",
): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return validationError(`${label} must be a JSON object.`);
  }

  return value as JsonObject;
}

export function rejectUnsupportedFields(
  value: JsonObject,
  supportedFields: readonly string[],
  label = "Request body",
) {
  const unsupportedFields = Object.keys(value).filter(
    (field) => !supportedFields.includes(field),
  );

  if (unsupportedFields.length > 0) {
    return validationError(
      `${label} contains unsupported fields: ${unsupportedFields.join(", ")}.`,
    );
  }
}

export function readIdentifier(value: unknown, field: string) {
  if (
    typeof value !== "string" ||
    !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)
  ) {
    return validationError(`${field} must be a valid identifier.`);
  }

  return value;
}

export function readText(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return validationError(`${field} must be a non-empty string.`);
  }

  if (value.length > 500) {
    return validationError(`${field} must not exceed 500 characters.`);
  }

  return value.trim();
}

export function readArtifactType(value: unknown): ArtifactType {
  if (value === "call" || value === "document" || value === "email") {
    return value;
  }

  return validationError(
    "type must be one of: call, document, email.",
  );
}

export function readArtifactInput(
  value: unknown,
): Pick<Artifact, "id" | "type"> {
  const body = readObject(value);
  rejectUnsupportedFields(body, ["id", "type"]);

  return {
    id: readIdentifier(body.id, "id"),
    type: readArtifactType(body.type),
  };
}

export function readTenant(value: unknown): Tenant {
  const body = readObject(value);
  rejectUnsupportedFields(body, ["id", "name"]);

  return {
    id: readIdentifier(body.id, "id"),
    name: readText(body.name, "name"),
  };
}

export function readCaseInput(
  value: unknown,
): Pick<CaseState, "id" | "name"> {
  const body = readObject(value);
  rejectUnsupportedFields(body, ["id", "name"]);

  return {
    id: readIdentifier(body.id, "id"),
    name: readText(body.name, "name"),
  };
}

export function readRule(value: unknown, label = "rule"): Rule {
  const rule = readObject(value, label);

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
      return validationError(`${label}.count must be a positive integer.`);
    }

    return {
      type: "countAtLeast",
      artifactType: readArtifactType(rule.artifactType),
      count: rule.count,
    };
  }

  if (rule.type === "all" || rule.type === "any") {
    rejectUnsupportedFields(rule, ["type", "rules"], label);

    if (!Array.isArray(rule.rules)) {
      return validationError(`${label}.rules must be an array.`);
    }

    return {
      type: rule.type,
      rules: rule.rules.map((nestedRule, index) =>
        readRule(nestedRule, `${label}.rules[${index}]`),
      ),
    };
  }

  return validationError(
    `${label}.type must be one of: countAtLeast, all, any.`,
  );
}
