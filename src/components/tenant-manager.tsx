"use client";

import { useEffect, useState, type FormEvent } from "react";

import type { ArtifactType, Tenant } from "../domain/types";
import {
  createTenant,
  getTenantRule,
  getTenants,
  saveTenantRule,
} from "../lib/api-client";

export function TenantManager() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [artifactType, setArtifactType] = useState<ArtifactType>("document");
  const [requiredCount, setRequiredCount] = useState(1);
  const [ruleLoading, setRuleLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getTenants()
      .then((loadedTenants) => {
        if (!active) {
          return;
        }

        setTenants(loadedTenants);
        setRuleLoading(loadedTenants.length > 0);
        setSelectedTenantId((currentTenantId) =>
          currentTenantId || loadedTenants[0]?.id || "",
        );
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(getMessage(loadError));
          setTenants([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedTenantId) {
      return;
    }

    let active = true;

    getTenantRule(selectedTenantId)
      .then((rule) => {
        if (!active) {
          return;
        }

        if (rule?.type === "countAtLeast") {
          setArtifactType(rule.artifactType);
          setRequiredCount(rule.count);
        } else {
          setArtifactType("document");
          setRequiredCount(1);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(getMessage(loadError));
        }
      })
      .finally(() => {
        if (active) {
          setRuleLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedTenantId]);

  async function handleCreateTenant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const tenant = await createTenant({
        id: String(formData.get("tenantId") ?? ""),
        name: String(formData.get("tenantName") ?? ""),
      });
      setTenants((currentTenants) => [...(currentTenants ?? []), tenant]);
      setRuleLoading(true);
      setSelectedTenantId(tenant.id);
      setSuccess("Tenant created.");
      form.reset();
    } catch (createError) {
      setError(getMessage(createError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await saveTenantRule(selectedTenantId, {
        type: "countAtLeast",
        artifactType,
        count: requiredCount,
      });
      setSuccess("Rule saved.");
    } catch (saveError) {
      setError(getMessage(saveError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading" aria-labelledby="tenants-title">
        <p className="eyebrow">Administration</p>
        <h1 id="tenants-title">Tenants</h1>
        <p className="intro">
          Create tenant workspaces and define their minimum evidence rules.
        </p>
      </section>

      {error ? <p role="alert" className="message error-message">{error}</p> : null}
      {success ? <p role="status" className="message success-message">{success}</p> : null}

      <div className="content-grid">
        <section className="panel" aria-labelledby="create-tenant-title">
          <h2 id="create-tenant-title">Create tenant</h2>
          <form className="form-stack" onSubmit={handleCreateTenant}>
            <label>
              Tenant ID
              <input name="tenantId" required />
            </label>
            <label>
              Tenant name
              <input name="tenantName" required />
            </label>
            <button type="submit" disabled={submitting}>
              Create tenant
            </button>
          </form>
        </section>

        <section className="panel" aria-labelledby="tenant-list-title">
          <h2 id="tenant-list-title">Tenant list</h2>
          {tenants === null ? <p role="status">Loading tenants…</p> : null}
          {tenants?.length === 0 ? <p>No tenants yet.</p> : null}
          {tenants && tenants.length > 0 ? (
            <ul className="record-list">
              {tenants.map((tenant) => (
                <li key={tenant.id}>
                  <strong>{tenant.name}</strong>
                  <span className="record-meta">{tenant.id}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      {tenants && tenants.length > 0 ? (
        <section className="panel" aria-labelledby="rule-editor-title">
          <h2 id="rule-editor-title">Readiness rule</h2>
          <form className="form-grid" onSubmit={handleSaveRule}>
            <label>
              Rule tenant
              <select
                value={selectedTenantId}
                onChange={(event) => {
                  setRuleLoading(true);
                  setSelectedTenantId(event.target.value);
                }}
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Artifact type
              <select
                value={artifactType}
                onChange={(event) =>
                  setArtifactType(event.target.value as ArtifactType)
                }
              >
                <option value="call">Call</option>
                <option value="document">Document</option>
                <option value="email">Email</option>
              </select>
            </label>
            <label>
              Required count
              <input
                type="number"
                min="1"
                value={requiredCount}
                onChange={(event) =>
                  setRequiredCount(Number(event.target.value))
                }
              />
            </label>
            <button type="submit" disabled={submitting || ruleLoading}>
              Save rule
            </button>
          </form>
          {ruleLoading ? <p role="status">Loading rule…</p> : null}
        </section>
      ) : null}
    </div>
  );
}

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}
