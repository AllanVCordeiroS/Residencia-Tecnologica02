import { redirect } from "next/navigation";

export default function Home() {
  // Isso garante que quem entrar no site vá direto para o login
  redirect("/login");
}