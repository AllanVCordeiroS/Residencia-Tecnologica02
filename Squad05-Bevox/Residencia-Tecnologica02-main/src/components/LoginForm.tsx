"use client";

import { useState, type FormEvent } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostraSenha, exibirSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [lembrarDispositivo, setLembrarDispositivo] = useState(true);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !senha) {
      setErro("Preencha o e-mail e sua senha.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Digite um e-mail válido.");
      return;
    }
    setErro("");
    setCarregando(true);

    try {
      //esquema pra conectar com a API
      console.log("Aguardando integração com a API.");
    } catch {
      setErro("Ocorreu um erro ao tentar entrar.");
    } finally {
      setCarregando(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          E-MAIL CORPORATIVO
        </label>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            @
          </span>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErro("");
            }}
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="senha" className="text-sm font-bold text-slate-700">
          SENHA DE ACESSO
        </label>

        <a
        //♙ ESSE SÍMBOLO É PROVISÓRIO A GENTE PRECISA INSTALAR ALGUMA BIBLIOTECA PRA PEGAR TODOS OS ICONES DO PROJETO
          href="#"//HREF N FUNCIONAL PQ ESTÁ FALTANDO A TELA DE ESQUECEU A SENHA
          className="text-xs font-medium text-blue-700 hover:text-blue-800"
        > 
          Esqueceu a senha?
        </a>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          ♙
        </span>

        <input
          id="senha"
          name="senha"
          type={mostraSenha ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(event) => {
            setSenha(event.target.value);
            setErro("");
          }}
          className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-12 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={() => exibirSenha(!mostraSenha)}
          aria-label={mostraSenha ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700"
        >
          {mostraSenha ? "Ocultar" : "Mostrar"}
        </button>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
        <input
          type="checkbox"
          checked={lembrarDispositivo}
          onChange={(event) => setLembrarDispositivo(event.target.checked)}
          className="h-4 w-4 cursor-pointer accent-blue-700"
        />
        Lembrar este dispositivo por 30 dias
      </label>

      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-lg bg-blue-700 px-4 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {carregando ? "Acessando Plataforma.." : "Acessar Plataforma"}
      </button>
    </form>
  );
}