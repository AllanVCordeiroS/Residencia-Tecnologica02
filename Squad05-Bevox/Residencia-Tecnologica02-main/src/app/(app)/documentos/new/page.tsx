import DocumentForm from "@/components/documentos/DocumentForm";

export default function CadastrarDocumentoPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cadastrar Novo Documento</h1>
      <DocumentForm />
    </div>
  );
}