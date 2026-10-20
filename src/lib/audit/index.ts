import { logger } from "@/lib/logger";

export interface AuditEvent {
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  username?: string;
  ipAddress?: string;
  status: "SUCCESS" | "FAILURE";
  details?: Record<string, unknown>;
}

export async function recordAuditEvent(event: AuditEvent): Promise<void> {
  const timestamp = new Date().toISOString();
  logger.info(`[AUDIT] ${event.action} on ${event.resource}`, {
    ...event,
    auditTimestamp: timestamp,
  });

  // Future persistence to database audit table (e.g. coda_audit_log)
}

