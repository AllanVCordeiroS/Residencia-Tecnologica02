import { EditUnit } from "@/components/unidades/UnitForm";

export default async function EditarUnidadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditUnit id={id} />;
}
