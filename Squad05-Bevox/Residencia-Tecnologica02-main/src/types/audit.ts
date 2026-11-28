export interface AuditEvent {
  id: string;
  userId: string;
  userName: string;
  responsible: string;
  action: string;
  module: string;
  occurredAt: string;
  description: string;
  ipAddress: string;
}

export interface ExternalIntegration {
  id: string;
  name: string;
  description: string;
  category: string;
  initials: string;
  color: string;
}
