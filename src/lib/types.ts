export type Store = {
  id: string; name: string; platform: string; eik: string | null; plan: string; api_key: string;
  website: string | null; nap_shop_number: string | null; is_marketplace: boolean;
  trial_ends_at: string; owner_id: string;
  subscription_status: string; current_period_end: string | null;
  receipt_lang: string; address: string | null; vat_number: string | null; logo_url: string | null; brand_color: string | null;
};
export type Item = { name: string; quantity: number; price: number; vatRate?: number };
export type Order = {
  id: string; external_id: string; customer_email: string | null; currency: string;
  total: number; total_eur: number | null; payment_method: string; ordered_at: string;
  doc_number: string | null; doc_date: string | null; discount: number; items: Item[];
  paym_code: number; pos_n: string | null; trans_n: string | null; proc_id: string | null;
};
export type Refund = { id: string; order_ref: string; amount: number; refunded_at: string; method_code: number; number: number | null; status: string; sent_at: string | null };
export type Member = { id: string; email: string; role: string };
export type Export = { id: string; period: string; status: string; submitted_at: string | null };
