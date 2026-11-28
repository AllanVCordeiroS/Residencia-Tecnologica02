import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getAuditEvents, getExternalIntegrations } from "@/services/audit";

export function useAuditQuery() {
  return useQuery({
    queryKey: [...queryKeys.settings.all, "audit"],
    queryFn: getAuditEvents,
  });
}

export function useIntegrationsQuery() {
  return useQuery({
    queryKey: [...queryKeys.settings.all, "integrations"],
    queryFn: getExternalIntegrations,
  });
}
