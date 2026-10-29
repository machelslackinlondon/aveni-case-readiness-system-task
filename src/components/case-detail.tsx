"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import type { ArtifactType, CaseState } from "../domain/types";
import { addArtifact, getCase } from "../lib/api-client";

type CaseDetailProps = {
  tenantId: string;
  caseId: string;
};

export function CaseDetail({ tenantId, caseId }: CaseDetailProps) {
  const [caseState, setCaseState] = useState<CaseState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getCase(tenantId, caseId)
      .then((loadedCase) => {
        if (active) {
          setCaseState(loadedCase);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(getMessage(loadError));
        }
      });

    return () => {
      active = false;
    };
  }, [caseId, tenantId]);

  async function handleAddArtifact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const artifactType = String(
      formData.get("artifactType") ?? "",
    ) as ArtifactType;

    try {
      const result = await addArtifact(tenantId, caseId, {
        id: String(formData.get("artifactId") ?? ""),
        type: artifactType,
      });
      setCaseState(result.case);
      setSuccess("Artifact added.");
      form.reset();
    } catch (addError) {
      setError(getMessage(addError));
    } finally {
      setSubmitting(false);
    }
  }

  if (caseState === null) {
    return (
      <div className="page-stack">
        <Link href="/cases">← Back to cases</Link>
        {error ? (
          <p role="alert" className="message error-message">{error}</p>
        ) : (
          <p role="status">Loading case…</p>
        )}
      </div>
    );
  }

  return (
    <div className="page-stack">
      <Link href="/cases">← Back to cases</Link>

      <section className="page-heading" aria-labelledby="case-title">
        <p className="eyebrow">Case detail</p>
        <h1 id="case-title">{caseState.name}</h1>
        <p className="intro">Case ID: {caseState.id}</p>
      </section>

      {error ? <p role="alert" className="message error-message">{error}</p> : null}
      {success ? <p role="status" className="message success-message">{success}</p> : null}

      <section className="panel case-summary" aria-labelledby="summary-title">
        <div>
          <h2 id="summary-title">Readiness</h2>
          <p>Tenant: {caseState.tenantId}</p>
        </div>
        <span
          className={`status-badge ${caseState.ready ? "ready" : "not-ready"}`}
        >
          {caseState.ready ? "Ready" : "Not ready"}
        </span>
      </section>

      <section className="panel" aria-labelledby="artifact-counts-title">
        <h2 id="artifact-counts-title">Artifact counts</h2>
        <dl className="metric-grid">
          <div>
            <dt>Calls</dt>
            <dd>{caseState.artifactCounts.call}</dd>
          </div>
          <div>
            <dt>Documents</dt>
            <dd>{caseState.artifactCounts.document}</dd>
          </div>
          <div>
            <dt>Emails</dt>
            <dd>{caseState.artifactCounts.email}</dd>
          </div>
        </dl>
      </section>

      <section className="panel" aria-labelledby="add-artifact-title">
        <h2 id="add-artifact-title">Add artifact</h2>
        <form className="form-grid" onSubmit={handleAddArtifact}>
          <label>
            Artifact ID
            <input name="artifactId" required />
          </label>
          <label>
            Artifact type
            <select name="artifactType" defaultValue="document">
              <option value="call">Call</option>
              <option value="document">Document</option>
              <option value="email">Email</option>
            </select>
          </label>
          <button type="submit" disabled={submitting}>
            Add artifact
          </button>
        </form>
      </section>
    </div>
  );
}

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}
