import { z } from "zod";

export const FindingSchema = z.object({
  id: z.string(),
  category: z.enum([
    "NICHT_UMLAGEFAEHIG",
    "RECHENFAHLER",
    "FRISTVERSTOSS",
    "VERTEILER_FEHLER",
    "FEHLENDE_BELEGE",
    "FORMFEHLER",
    "VERDACHT",
  ]),
  severity: z.enum(["critical", "warning", "info"]),
  title: z.string(),
  description: z.string(),
  legal_basis: z.string(),
  position_in_document: z.string().nullable(),
  claimed_amount: z.number().nullable(),
  potential_saving: z.number().nullable(),
  widerspruch_text: z.string().nullable(),
});

export const ClaudeResponseSchema = z.object({
  landlord_name: z.string().nullable(),
  tenant_name: z.string().nullable(),
  address: z.string().nullable(),
  abrechnungsjahr: z.number().nullable(),
  abrechnungszeitraum_start: z.string().nullable(),
  abrechnungszeitraum_end: z.string().nullable(),
  widerspruchsfrist_end: z.string().nullable(),
  abrechnungsfrist_violated: z.boolean(),
  total_nachzahlung: z.number().nullable(),
  total_guthaben: z.number().nullable(),
  risk_score: z.number().min(0).max(100),
  summary: z.string(),
  findings: z.array(FindingSchema),
});

export type ClaudeResponse = z.infer<typeof ClaudeResponseSchema>;
