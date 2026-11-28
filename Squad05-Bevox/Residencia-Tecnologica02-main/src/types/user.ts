export type {
  User,
  UserActivity,
  UserRole,
  UserStatus,
} from "@/schemas/user";

import type { User, Permissoes, AvatarTone } from "@/schemas/user";

/** Campos ausentes na fonte permanecem opcionais. */
export type UserDetail = Omit<User, "phone" | "mfaEnabled" | "createdAt" | "createdWith"> &
  Partial<Pick<User, "phone" | "mfaEnabled" | "createdAt" | "createdWith">> & {
    permissions: Permissoes;
    avatarTone: AvatarTone;
  };
