import FacturesTable from "@/components/factures/FacturesTable";
import { listFactures, normalizeFacture } from "@/lib/factures.api";
import { listBonLivraisons } from "@/lib/bon-livraisons.api";
import { BonLivraisonOption } from "@/types/bon-livraison";
import { TableFacture } from "@/types/facture";

type PageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function FacturesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params?.page || "1");

  const [facturesResult, blResult] = await Promise.all([
    listFactures(currentPage),
    listBonLivraisons(1),
  ]);

  const rows: TableFacture[] = facturesResult.factures.data.map(normalizeFacture);

  const bonsLivraisonOptions: BonLivraisonOption[] = blResult.bonLivraisons.data.map(
    (item: any) => ({
      id: item.id,
      numero_bl: item.numero_bl,
      quantite_recue: Number(item.quantite_recue),
      date_reception: item.date_reception,
      numero_commande: item.numero_commande || "N/A",
      commande: item.commande
        ? {
            id: item.commande.id,
            numero_commande: item.commande.numero_commande,
            fournisseur_id: item.commande.fournisseur_id,
            date_livraison_prevue: item.commande.date_livraison_prevue,
            contrat: item.commande.contrat
              ? {
                  id: item.commande.contrat.id,
                  prix_unitaire: item.commande.contrat.prix_unitaire,
                  taux_penalite_retard: item.commande.contrat.taux_penalite_retard,
                }
              : null,
          }
        : null,
    })
  );

  return (
    <div className="p-6">
      <div className="mt-8">
        <FacturesTable
          data={rows}
          pagination={facturesResult.factures.paginatorInfo}
          bonsLivraison={bonsLivraisonOptions}
        />
      </div>
    </div>
  );
}