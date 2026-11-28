import type { LicenseFormValues } from '@/schemas/license';

export type LicenseStatus = 'Regular' | 'A vencer' | 'Vencida' | 'Ainda não vigente' | 'Vigência não informada';
export type License = Omit<LicenseFormValues, 'arquivo'> & {
  id: string;
  unidadeNome: string;
  unidadeTipo: string;
  responsavelNome: string;
  arquivo?: File;
};
export type UnitLicenseRestriction = {
  blocked: boolean;
  permitido: boolean;
  mensagem: string | null;
  licenses: License[];
};
