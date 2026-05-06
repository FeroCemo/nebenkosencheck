export interface Finding {
  id: string;
  category:
    | "NICHT_UMLAGEFAEHIG"
    | "RECHENFAHLER"
    | "FRISTVERSTOSS"
    | "VERTEILER_FEHLER"
    | "FEHLENDE_BELEGE"
    | "FORMFEHLER"
    | "VERDACHT";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  legal_basis: string;
  position_in_document: string | null;
  claimed_amount: number | null;
  potential_saving: number | null;
  widerspruch_text: string | null;
}

export interface Analysis {
  id: string;
  user_id: string;
  created_at: string;
  status: "pending" | "processing" | "done" | "error";
  pdf_storage_path: string;
  extracted_text: string | null;
  zustelldatum: string | null;
  abrechnungsjahr: number | null;
  abrechnungszeitraum_start: string | null;
  abrechnungszeitraum_end: string | null;
  widerspruchsfrist_end: string | null;
  abrechnungsfrist_violated: boolean | null;
  landlord_name: string | null;
  tenant_name: string | null;
  address: string | null;
  total_nachzahlung: number | null;
  total_guthaben: number | null;
  findings: Finding[] | null;
  risk_score: number | null;
  summary: string | null;
  widerspruchsbrief: string | null;
}

export interface Profile {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: "free" | "pro" | "one_time";
  free_analyses_used: number;
  created_at: string;
}
