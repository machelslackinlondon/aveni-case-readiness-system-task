import Link from "next/link";

import { CaseDetail } from "../../../components/case-detail";

type CasePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    tenantId?: string | string[];
  }>;
};

export default async function CasePage({
  params,
  searchParams,
}: CasePageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const tenantId = typeof query.tenantId === "string"
    ? query.tenantId
    : null;

  if (tenantId === null) {
    return (
      <div className="page-stack">
        <Link href="/cases">← Back to cases</Link>
        <p role="alert" className="message error-message">
          A tenant must be selected to view this case.
        </p>
      </div>
    );
  }

  return <CaseDetail tenantId={tenantId} caseId={id} />;
}
