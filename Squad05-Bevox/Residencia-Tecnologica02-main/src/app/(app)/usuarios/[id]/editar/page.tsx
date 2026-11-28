import UserEditQuery from "@/components/usuarios/user-edit-query";

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserEditQuery id={id} />;
}
