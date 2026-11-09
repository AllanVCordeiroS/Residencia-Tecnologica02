"use client";

import { useState, type ReactNode } from "react";
import {
  Activity,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  KeyRound,
  LockKeyhole,
  Mail,
  MailPlus,
  MapPin,
  Pencil,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";

import type {
  User,
  UserActivity,
  UserStatus,
} from "../../types/user";

type UserTab =
  | "Informações"
  | "Permissões"
  | "Unidades"
  | "Histórico de atividades";

interface UserDetailsProps {
  user: User;
  onEdit?: (user: User) => void;
  onDeactivate?: (user: User) => void;
  onDelete?: (user: User) => void;
  onChangeRole?: (user: User) => void;
  onManageUnits?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onResendInvite?: (user: User) => void;
}

interface SectionCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}

interface SummaryCardProps {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
  online?: boolean;
}

interface InfoRowProps {
  label: string;
  value: ReactNode;
}

interface ActionButtonProps {
  children: ReactNode;
  icon: ReactNode;
  variant?: "default" | "danger";
  onClick?: () => void;
}

interface QuickActionProps {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

const tabs: UserTab[] = [
  "Informações",
  "Permissões",
  "Unidades",
  "Histórico de atividades",
];

const statusStyles: Record<UserStatus, string> = {
  Ativo: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Convite pendente": "bg-amber-50 text-amber-700 ring-amber-200",
  Inativo: "bg-slate-100 text-slate-600 ring-slate-200",
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "U";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function getUnits(units: string[] | string): string[] {
  if (Array.isArray(units)) {
    return units;
  }

  return units
    .split(",")
    .map((unit) => unit.trim())
    .filter(Boolean);
}

function SectionCard({
  title,
  description,
  icon,
  children,
}: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  icon,
  online = false,
}: SummaryCardProps) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>

      <p className="mt-4 break-words text-base font-semibold leading-6 text-slate-900">
        {value || "—"}
      </p>

      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        {online ? (
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-emerald-500"
            aria-label="Usuário online"
            title="Usuário online"
          />
        ) : null}
        <span>{detail}</span>
      </div>
    </article>
  );
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="grid grid-cols-1 gap-1 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(130px,0.8fr)_minmax(0,1.2fr)] sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="break-words text-sm font-medium leading-5 text-slate-800">
        {value ?? "—"}
      </dd>
    </div>
  );
}

function ActionButton({
  children,
  icon,
  variant = "default",
  onClick,
}: ActionButtonProps) {
  const variants = {
    default:
      "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    danger: "border-red-200 bg-white text-red-600 hover:bg-red-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${variants[variant]}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

function QuickAction({ label, icon, onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium text-slate-700">
        {label}
      </span>
      <ChevronRight
        size={16}
        className="shrink-0 text-slate-400"
        aria-hidden="true"
      />
    </button>
  );
}

function PersonalInfoCard({ user }: { user: User }) {
  return (
    <SectionCard
      title="Dados pessoais"
      description="Informações de identificação e contato do usuário."
      icon={<Users size={19} aria-hidden="true" />}
    >
      <dl className="divide-y divide-slate-100">
        <InfoRow label="Nome completo" value={user.name} />
        <InfoRow
          label="E-mail corporativo"
          value={
            <span className="inline-flex items-center gap-2">
              <Mail
                size={15}
                className="shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <span>{user.email}</span>
            </span>
          }
        />
        <InfoRow
          label="Telefone"
          value={
            <span className="inline-flex items-center gap-2">
              <Phone
                size={15}
                className="shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <span>{user.phone || "Não informado"}</span>
            </span>
          }
        />
        <InfoRow
          label="Cargo ou função"
          value={user.jobTitle || "Não informado"}
        />
      </dl>
    </SectionCard>
  );
}

function OrganizationCard({ user }: { user: User }) {
  const primaryUnit =
    user.primaryUnit ??
    (typeof user.units === "string" ? user.units : user.units.join(", "));

  return (
    <SectionCard
      title="Vínculo organizacional"
      description="Dados de vínculo e perfil de acesso."
      icon={<Building2 size={19} aria-hidden="true" />}
    >
      <dl className="divide-y divide-slate-100">
        <InfoRow
          label="Unidade principal"
          value={primaryUnit || "Não informada"}
        />
        <InfoRow label="Perfil de acesso" value={user.role} />
        <InfoRow
          label="Data de início"
          value={user.startDate ?? "Não informada"}
        />
        <InfoRow
          label="Data de fim"
          value={user.endDate ?? "Sem data de término"}
        />
      </dl>
    </SectionCard>
  );
}

function PermissionsCard({ user }: { user: User }) {
  const modules = user.authorizedModules ?? [];

  return (
    <SectionCard
      title="Permissões e acesso"
      description="Módulos autorizados para o perfil deste usuário."
      icon={<ShieldCheck size={19} aria-hidden="true" />}
    >
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 ${
          user.fullAccess
            ? "border-blue-200 bg-blue-50"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            user.fullAccess
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          <LockKeyhole size={18} aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {user.fullAccess
              ? "Acesso total a todos os módulos do sistema"
              : "Permissões atribuídas ao perfil"}
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            {user.fullAccess
              ? "Este perfil está configurado com acesso completo aos módulos apresentados abaixo."
              : `Perfil atual: ${user.role}. Consulte as permissões específicas antes de realizar alterações.`}
          </p>
        </div>
      </div>

      {modules.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {modules.map((moduleName) => (
            <div
              key={moduleName}
              className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 px-3.5 py-3"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Check size={13} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="text-sm leading-5 text-slate-700">
                {moduleName}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Não há módulos cadastrados no conjunto demonstrativo de permissões.
        </p>
      )}
    </SectionCard>
  );
}

function UnitsCard({ user }: { user: User }) {
  const units = getUnits(user.units);

  return (
    <SectionCard
      title="Unidades autorizadas"
      description="Unidades vinculadas ao acesso deste usuário."
      icon={<Building2 size={19} aria-hidden="true" />}
    >
      {units.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {units.map((unit) => (
            <div
              key={unit}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Building2 size={19} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-slate-800">
                  {unit}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={12} aria-hidden="true" />
                  Unidade autorizada
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Nenhuma unidade vinculada foi informada.
        </p>
      )}
    </SectionCard>
  );
}

function ActivityTimeline({
  activities,
  compact = false,
}: {
  activities?: UserActivity[];
  compact?: boolean;
}) {
  if (!activities || activities.length === 0) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Nenhuma atividade registrada para exibição.
      </p>
    );
  }

  return (
    <ol className={compact ? "space-y-5" : "space-y-6"}>
      {activities.map((activity, index) => (
        <li key={activity.id} className="relative flex gap-3">
          <div className="relative flex w-9 shrink-0 justify-center">
            <span
              className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full ${
                index === 0
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {index === 0 ? (
                <CheckCircle2 size={17} aria-hidden="true" />
              ) : (
                <Activity size={17} aria-hidden="true" />
              )}
            </span>
            {index < activities.length - 1 ? (
              <span
                className="absolute left-1/2 top-9 h-[calc(100%+0.75rem)] w-px -translate-x-1/2 bg-slate-200"
                aria-hidden="true"
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1 pb-1">
            <p className="break-words text-sm font-semibold text-slate-800">
              {activity.title}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {activity.description}
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <CalendarDays size={13} aria-hidden="true" />
              <span>{activity.date}</span>
              <span aria-hidden="true">•</span>
              <Clock3 size={13} aria-hidden="true" />
              <span>{activity.time}</span>
            </p>
            <p className="mt-1 break-all text-xs text-slate-400">
              IP: {activity.ipAddress}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ActiveUserCard({ user }: { user: User }) {
  const isActive = user.status === "Ativo";

  return (
    <SectionCard
      title="Usuário ativo"
      icon={
        isActive ? (
          <CheckCircle2 size={19} aria-hidden="true" />
        ) : (
          <ShieldAlert size={19} aria-hidden="true" />
        )
      }
    >
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 ${
          isActive
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {isActive ? (
            <Check size={17} aria-hidden="true" />
          ) : (
            <LockKeyhole size={17} aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">
            {isActive ? "Conta ativa e liberada" : `Status: ${user.status}`}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {isActive
              ? "O status atual deste usuário é ativo."
              : "O status atual não indica uma conta ativa."}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

function QuickActionsCard({
  user,
  onChangeRole,
  onManageUnits,
  onResetPassword,
  onResendInvite,
}: {
  user: User;
  onChangeRole?: (user: User) => void;
  onManageUnits?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onResendInvite?: (user: User) => void;
}) {
  return (
    <SectionCard
      title="Ações rápidas"
      description="Atalhos para o gerenciamento do usuário."
      icon={<UserCog size={19} aria-hidden="true" />}
    >
      <div className="space-y-2.5">
        <QuickAction
          label="Alterar perfil"
          icon={<UserCog size={17} aria-hidden="true" />}
          onClick={() => onChangeRole?.(user)}
        />
        <QuickAction
          label="Gerenciar unidades"
          icon={<Building2 size={17} aria-hidden="true" />}
          onClick={() => onManageUnits?.(user)}
        />
        <QuickAction
          label="Resetar senha"
          icon={<KeyRound size={17} aria-hidden="true" />}
          onClick={() => onResetPassword?.(user)}
        />
        <QuickAction
          label="Enviar novo convite"
          icon={<MailPlus size={17} aria-hidden="true" />}
          onClick={() => onResendInvite?.(user)}
        />
      </div>
    </SectionCard>
  );
}

function SecurityCard() {
  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <ShieldCheck size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-blue-950">
            Segurança e rastreabilidade
          </h2>
          <p className="mt-2 text-xs leading-5 text-blue-900/80">
            As ações realizadas no perfil devem ser registradas para permitir
            rastreabilidade e auditoria. A persistência e a consulta desses
            registros dependem da integração com o mecanismo de auditoria
            do sistema.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function UserDetails({
  user,
  onEdit,
  onDeactivate,
  onDelete,
  onChangeRole,
  onManageUnits,
  onResetPassword,
  onResendInvite,
}: UserDetailsProps) {
  const [activeTab, setActiveTab] = useState<UserTab>("Informações");
  const initials = getInitials(user.name);
  const primaryUnit =
    user.primaryUnit ??
    (typeof user.units === "string" ? user.units : user.units.join(", "));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-800 ring-1 ring-blue-200"
              aria-label={`Iniciais de ${user.name}: ${initials}`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {user.name}
                </h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[user.status]}`}
                >
                  {user.status}
                </span>
              </div>
              <p className="mt-2 flex min-w-0 items-center gap-2 break-all text-sm text-slate-500">
                <Mail size={16} className="shrink-0" aria-hidden="true" />
                {user.email}
              </p>
              <p className="mt-1 text-sm text-slate-500">{user.jobTitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionButton
              icon={<Pencil size={15} aria-hidden="true" />}
              onClick={() => onEdit?.(user)}
            >
              Editar
            </ActionButton>
            <ActionButton
              icon={<LockKeyhole size={15} aria-hidden="true" />}
              onClick={() => onDeactivate?.(user)}
            >
              Desativar
            </ActionButton>
            <ActionButton
              variant="danger"
              icon={<Trash2 size={15} aria-hidden="true" />}
              onClick={() => onDelete?.(user)}
            >
              Excluir
            </ActionButton>
          </div>
        </div>
      </section>

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4"
        aria-label="Resumo do usuário"
      >
        <SummaryCard
          title="Perfil de acesso"
          value={user.role}
          detail={
            user.fullAccess
              ? "Permissão total no sistema"
              : "Perfil de acesso atribuído"
          }
          icon={<ShieldCheck size={19} aria-hidden="true" />}
        />
        <SummaryCard
          title="Unidades vinculadas"
          value={primaryUnit || "Não informada"}
          detail="Unidades disponíveis para este perfil"
          icon={<Building2 size={19} aria-hidden="true" />}
        />
        <SummaryCard
          title="Último acesso"
          value={user.lastAccess || "Sem registro"}
          detail={user.isOnline ? "Online" : "Último acesso registrado"}
          icon={<Clock3 size={19} aria-hidden="true" />}
          online={user.isOnline}
        />
        <SummaryCard
          title="Data de cadastro"
          value={user.createdAt || "Não informada"}
          detail={`Por: ${user.createdWith || "Não informado"}`}
          icon={<CalendarDays size={19} aria-hidden="true" />}
        />
      </section>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div
          role="tablist"
          aria-label="Seções dos detalhes do usuário"
          className="flex min-w-max gap-1 border-b border-slate-200 px-3 pt-2 sm:px-5"
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                id={`tab-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="user-tab-panel"
                onClick={() => setActiveTab(tab)}
                className={`relative whitespace-nowrap rounded-t-lg px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:px-4 ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {tab}
                {isActive ? (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-blue-600" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div
          id="user-tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tabs.indexOf(activeTab)}`}
          className="min-w-0 space-y-6"
        >
          {activeTab === "Informações" ? (
            <>
              <PersonalInfoCard user={user} />
              <OrganizationCard user={user} />
              <PermissionsCard user={user} />
              <UnitsCard user={user} />
            </>
          ) : null}
          {activeTab === "Permissões" ? (
            <PermissionsCard user={user} />
          ) : null}
          {activeTab === "Unidades" ? <UnitsCard user={user} /> : null}
          {activeTab === "Histórico de atividades" ? (
            <SectionCard
              title="Histórico de atividades"
              description="Registros demonstrativos de acessos e alterações relacionados ao usuário."
              icon={<Activity size={19} aria-hidden="true" />}
            >
              <ActivityTimeline activities={user.activities} />
            </SectionCard>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-6">
          <ActiveUserCard user={user} />
          <QuickActionsCard
            user={user}
            onChangeRole={onChangeRole}
            onManageUnits={onManageUnits}
            onResetPassword={onResetPassword}
            onResendInvite={onResendInvite}
          />
          <SectionCard
            title="Últimas atividades"
            description="Ações recentes associadas ao perfil."
            icon={<Clock3 size={19} aria-hidden="true" />}
          >
            <ActivityTimeline
              activities={user.activities?.slice(0, 4)}
              compact
            />
          </SectionCard>
          <SecurityCard />
        </aside>
      </div>
    </div>
  );
}
