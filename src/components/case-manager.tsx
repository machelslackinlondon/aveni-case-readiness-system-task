"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import type { CaseState, Tenant } from "../domain/types";
import { createCase, getCases, getTenants } from "../lib/api-client";

export function CaseManager() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [cases, setCases] = useState<CaseState[] | null>(null);
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
        setSelectedTenantId(loadedTenants[0]?.id ?? "");

        if (loadedTenants.length === 0) {
          setCases([]);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(getMessage(loadError));
          setTenants([]);
          setCases([]);
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

    getCases(selectedTenantId)
      .then((loadedCases) => {
        if (active) {
          setCases(loadedCases);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(getMessage(loadError));
          setCases([]);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedTenantId]);

  async function handleCreateCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const createdCase = await createCase(selectedTenantId, {
        id: String(formData.get("caseId") ?? ""),
        name: String(formData.get("caseName") ?? ""),
      });
      setCases((currentCases) => [...(currentCases ?? []), createdCase]);
      setSuccess("Case created.");
      form.reset();
    } catch (createError) {
      setError(getMessage(createError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading" aria-labelledby="cases-title">
        <p className="eyebrow">Casework</p>
        <h1 id="cases-title">Cases</h1>
        <p className="intro">
          Track tenant-scoped cases and their readiness status.
        </p>
      </section>

      {error ? <p role="alert" className="message error-message">{error}</p> : null}
      {success ? <p role="status" className="message success-message">{success}</p> : null}

      {tenants === null ? <p role="status">Loading tenants…</p> : null}
      {tenants?.length === 0 ? (
        <section className="panel">
          <h2>No tenants available</h2>
          <p>Create a tenant before adding cases.</p>
        </section>
      ) : null}

      {tenants && tenants.length > 0 ? (
        <>
          <section className="panel compact-panel">
            <label>
              Tenant
              <select
                value={selectedTenantId}
                onChange={(event) => {
                  setCases(null);
                  setError(null);
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
          </section>

          <div className="content-grid">
            <section className="panel" aria-labelledby="create-case-title">
              <h2 id="create-case-title">Create case</h2>
              <form className="form-stack" onSubmit={handleCreateCase}>
                <label>
                  Case ID
                  <input name="caseId" required />
                </label>
                <label>
                  Case name
                  <input name="caseName" required />
                </label>
                <button type="submit" disabled={submitting}>
                  Create case
                </button>
              </form>
            </section>

            <section
              className="panel"
              aria-labelledby="case-list-title"
            >
              <h2 id="case-list-title">Case list</h2>
              {cases === null ? <p role="status">Loading cases…</p> : null}
              {cases?.length === 0 ? <p>No cases yet.</p> : null}
              {cases && cases.length > 0 ? (
                <ul className="record-list">
                  {cases.map((caseState) => (
                    <li key={caseState.id}>
                      <div>
                        <Link
                          href={`/cases/${encodeURIComponent(caseState.id)}?tenantId=${encodeURIComponent(selectedTenantId)}`}
                        >
                          {caseState.name}
                        </Link>
                        <span className="record-meta">{caseState.id}</span>
                      </div>
                      <span
                        className={`status-badge ${caseState.ready ? "ready" : "not-ready"}`}
                      >
                        {caseState.ready ? "Ready" : "Not ready"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}
