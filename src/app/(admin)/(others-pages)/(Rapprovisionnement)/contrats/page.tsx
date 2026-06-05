import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ContratTable from "@/components/contrats/ContratTable";
import { listContrats } from "@/lib/contrats.api";
import { normalizeContrat, TableContrat } from "@/types/contrat";

export default async function ContratsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);

  const res = await listContrats(currentPage);
  const rows = res.contrats.data.map(normalizeContrat);
  const pagination = res.contrats.paginatorInfo;

  return (
    <div className="p-6">
      <div className="mt-8">
          <ContratTable data={rows} pagination={pagination} />
      </div>
    </div>
  );
}
