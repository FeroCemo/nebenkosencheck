CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'free',
  free_analyses_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  pdf_storage_path TEXT NOT NULL,
  extracted_text TEXT,
  zustelldatum DATE,
  abrechnungsjahr INTEGER,
  abrechnungszeitraum_start DATE,
  abrechnungszeitraum_end DATE,
  widerspruchsfrist_end DATE,
  abrechnungsfrist_violated BOOLEAN,
  landlord_name TEXT,
  tenant_name TEXT,
  address TEXT,
  total_nachzahlung NUMERIC(10,2),
  total_guthaben NUMERIC(10,2),
  findings JSONB,
  risk_score INTEGER,
  summary TEXT,
  widerspruchsbrief TEXT
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON analyses FOR ALL USING (user_id = auth.uid());
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON profiles FOR ALL USING (id = auth.uid());

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
