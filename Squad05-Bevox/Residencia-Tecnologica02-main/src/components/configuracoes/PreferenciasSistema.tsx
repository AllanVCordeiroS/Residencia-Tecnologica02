import type { ReactNode } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Globe,
  Grid3x3,
  List,
  Monitor,
  Moon,
  Rows3,
  Save,
  SlidersHorizontal,
  Sun,
  UserRound,
} from "lucide-react";

type PreferenceFieldProps = {
  label: string;
  children: ReactNode;
};

type StaticSelectProps = {
  value: string;
  leading?: ReactNode;
};

type StaticToggleProps = {
  enabled: boolean;
};

type TableViewOptionProps = {
  label: string;
  selected: boolean;
  icon: ReactNode;
};

type ThemeOptionProps = {
  label: string;
  selected: boolean;
  icon: ReactNode;
};

function PreferenceField({ label, children }: PreferenceFieldProps) {
  return (
    <div className="bevox-settings-field">
      <div className="bevox-settings-field-label">{label}</div>
      {children}
    </div>
  );
}

function StaticSelect({ value, leading }: StaticSelectProps) {
  return (
    <div className="bevox-settings-select" aria-label={value}>
      {leading ? <span className="bevox-settings-select-leading">{leading}</span> : null}
      <span className="bevox-settings-select-value">{value}</span>
      <ChevronDown className="bevox-settings-chevron" size={16} strokeWidth={2} aria-hidden="true" />
    </div>
  );
}

function StaticToggle({ enabled }: StaticToggleProps) {
  return (
    <span
      className={`bevox-settings-toggle ${enabled ? "is-on" : "is-off"}`}
      aria-hidden="true"
    >
      <span className="bevox-settings-toggle-thumb" />
    </span>
  );
}

function TogglePreference({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="bevox-settings-toggle-preference">
      <span className="bevox-settings-field-label">{label}</span>
      <div className="bevox-settings-toggle-line">
        <StaticToggle enabled={enabled} />
        <span className="bevox-settings-toggle-caption">Sim</span>
      </div>
    </div>
  );
}

function TableViewOption({ label, selected, icon }: TableViewOptionProps) {
  return (
    <div
      className={`bevox-settings-table-option ${selected ? "is-selected" : ""}`}
      aria-label={`${label}${selected ? ", selecionada" : ""}`}
    >
      <span className="bevox-settings-table-option-icon">{icon}</span>
      <span className="bevox-settings-choice-indicator" aria-hidden="true">
        {selected ? <Check size={11} strokeWidth={3} /> : null}
      </span>
      <span className="bevox-settings-table-option-label">{label}</span>
    </div>
  );
}

function ThemeOption({ label, selected, icon }: ThemeOptionProps) {
  return (
    <div
      className={`bevox-settings-theme-option ${selected ? "is-selected" : ""}`}
      aria-label={`${label}${selected ? ", selecionado" : ""}`}
    >
      <span className="bevox-settings-theme-icon">{icon}</span>
      <span className="bevox-settings-theme-label">{label}</span>
    </div>
  );
}

/**
 * Réplica visual da área de Preferências do Sistema do BEVOX.
 * Sidebar, Header e Rodapé pertencem ao layout principal da aplicação e não
 * são renderizados por este componente.
 *
 * Os controles são somente visuais nesta entrega. Nenhuma preferência é
 * persistida e os botões não executam ações de negócio.
 */
export default function PreferenciasSistema() {
  return (
    <div className="bevox-settings-page">
      <div className="bevox-settings-content">
        <div className="bevox-settings-page-heading">
          <span className="bevox-settings-heading-icon" aria-hidden="true">
            <SlidersHorizontal size={19} strokeWidth={2} />
          </span>
          <div className="bevox-settings-heading-copy">
            <h1>Preferências do Sistema</h1>
            <p>Gerencie as preferências globais e individuais do sistema.</p>
          </div>
        </div>

        <div className="bevox-settings-top-grid">
          <section className="bevox-settings-card bevox-settings-localization-card">
            <div className="bevox-settings-section-heading">
              <Globe size={22} strokeWidth={2.5} aria-hidden="true" />
              <div>
                <h2>Preferências Globais de Localização</h2>
                <p>Configurações aplicáveis a todas as unidades por padrão.</p>
              </div>
            </div>

            <div className="bevox-settings-field-stack">
              <PreferenceField label="Idioma do Sistema">
                <StaticSelect value="Português - BR" leading={<span className="bevox-settings-flag">🇧🇷</span>} />
              </PreferenceField>
              <PreferenceField label="Formato de Data">
                <StaticSelect value="DD/MM/AAAA" />
              </PreferenceField>
              <PreferenceField label="Fuso Horário Padrão">
                <StaticSelect value="(GMT-03:00) America/Sao_Paulo" />
              </PreferenceField>
            </div>
          </section>

          <section className="bevox-settings-card bevox-settings-table-card">
            <div className="bevox-settings-section-heading">
              <Grid3x3 size={22} strokeWidth={2.5} aria-hidden="true" />
              <div>
                <h2>Visualização e Comportamento de Tabelas</h2>
                <p>Padrões de renderização e interação com tabelas.</p>
              </div>
            </div>

            <div className="bevox-settings-table-preferences-grid">
              <TogglePreference label="Paginação Automática" enabled={false} />
              <TogglePreference label="Manter Filtros após Atualizar" enabled />
              <TogglePreference label="Exibir Resumo de Linhas" enabled />
              <div className="bevox-settings-view-preference">
                <span className="bevox-settings-field-label">Visualização de Tabelas</span>
                <div className="bevox-settings-table-options">
                  <TableViewOption label="Lista Compacta" selected={false} icon={<List size={23} strokeWidth={2.2} />} />
                  <TableViewOption label="Lista Padrão" selected icon={<Rows3 size={23} strokeWidth={2.2} />} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="bevox-settings-card bevox-settings-user-card">
          <div className="bevox-settings-section-heading">
            <UserRound size={22} strokeWidth={2.5} aria-hidden="true" />
            <div>
              <h2>Preferências Individuais do Usuário</h2>
              <p>Suas configurações pessoais que sobrescrevem os padrões globais apenas para você.</p>
            </div>
          </div>

          <div className="bevox-settings-user-grid">
            <div className="bevox-settings-user-column">
              <PreferenceField label="Idioma de Exibição Pessoal">
                <StaticSelect value="Português - BR" />
              </PreferenceField>
              <TogglePreference label="Exibir Alertas Visuais" enabled />
            </div>

            <div className="bevox-settings-user-column">
              <PreferenceField label="Formato de Data Pessoal">
                <StaticSelect value="DD/MM/AAAA" />
              </PreferenceField>
            </div>

            <div className="bevox-settings-user-column bevox-settings-theme-column">
              <div className="bevox-settings-field-label">Tema do Sistema Pessoal</div>
              <div className="bevox-settings-theme-options">
                <ThemeOption label="Claro" selected icon={<Sun size={19} strokeWidth={2} />} />
                <ThemeOption label="Escuro" selected={false} icon={<Moon size={19} strokeWidth={2} />} />
                <ThemeOption label="Automático" selected={false} icon={<Monitor size={19} strokeWidth={2} />} />
              </div>
              <TogglePreference label="Ativar Sons de Notificação" enabled />
            </div>
          </div>
        </section>

        <div className="bevox-settings-actions" aria-label="Ações demonstrativas">
          <div className="bevox-settings-action bevox-settings-action-secondary">
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
            <span>Voltar</span>
          </div>
          <div className="bevox-settings-action bevox-settings-action-primary">
            <Save size={15} strokeWidth={2} aria-hidden="true" />
            <span>Salvar Alterações</span>
          </div>
        </div>
      </div>
    </div>
  );
}