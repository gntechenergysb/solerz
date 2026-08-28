import { supabase } from './supabaseClient';

export interface LeadFormData {
  name: string;
  email: string;
  phone?: string;
  postalCode?: string;
  comments?: string;
}

export interface LeadSubmission extends LeadFormData {
  source: 'auto-sizer' | 'diy-simulator';
  systemSummary: string;
  systemKwp: number;
}

/**
 * Insert a lead inquiry into Supabase `leads` table.
 * Returns true on success, false on failure (fails silently for UX).
 */
export async function submitLeadInquiry(lead: LeadSubmission): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leads')
      .insert({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || null,
        postal_code: lead.postalCode || null,
        comments: lead.comments || null,
        source: lead.source,
        system_summary: lead.systemSummary,
        system_kwp: lead.systemKwp,
      });

    if (error) {
      console.error('Failed to store lead inquiry:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Lead submission network error:', err);
    return false;
  }
}
