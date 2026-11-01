"use client";
import { useRouter } from "next/navigation";
import DocumentsPage from "../page";
import ImportModal from "@/components/documentos/import/ImportModal";

export default function ImportPage() {
  const router = useRouter();
  return (
    <>
      <DocumentsPage />
      <ImportModal onClose={() => router.push("/documentos")} />
    </>
  );
}