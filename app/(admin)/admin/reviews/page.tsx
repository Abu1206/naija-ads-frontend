import { requireRole } from "@/lib/auth";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

interface ReviewItem {
  id: string;
  kind: string;
  name: string;
  status: string;
}

// Admin verification queues: businesses, developers, apps, campaigns, creatives.
export default async function ReviewsPage() {
  await requireRole("admin");
  const queue: ReviewItem[] = [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Review queue</h1>
      <DataTable<ReviewItem>
        columns={[
          { key: "kind", header: "Type", render: (r) => r.kind },
          { key: "name", header: "Name", render: (r) => r.name },
          { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
        rows={queue}
        emptyMessage="Review queue is empty."
        getRowKey={(r) => r.id}
      />
    </div>
  );
}
