import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Digite um e-mail válido."),
  senha: z.string().min(1, "Preencha sua senha."),
});

export const sessionSchema = z.object({
  email: z.string().trim().email(),
});
