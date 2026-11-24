"use client";

import { useEffect, useState } from "react";

import {
  getFallbackSessionUser,
  getSessionUser,
} from "@/lib/auth-cookie";
import type { Usuario } from "@/types";

export function useSessionUser(): Usuario {
  const [user, setUser] = useState(getFallbackSessionUser);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  return user;
}
