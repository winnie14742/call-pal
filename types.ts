export type AppMode = 'calm' | 'power';

export type DoorType =
  | 'doctor'
  | 'bank'
  | 'pharmacy'
  | 'insurance'
  | 'utility';

export interface Intent {
  intent: 'book_appointment' | 'dispute_charge' | 'refill_prescription' | 'insurance_query' | 'utility_service' | string;
  door: DoorType;
  provider_name: string;
  provider_phone: string;
  reason: string;
  time_preference?: string;
  prescription_number?: string;
  user_name: string;
  mode: AppMode;
}

export interface UserProfile {
  name: string;
  mode: AppMode;
  doctor_name: string;
  doctor_phone: string;
  bank_name: string;
  bank_phone: string;
  pharmacy_name: string;
  pharmacy_phone: string;
  insurance_name: string;
  insurance_phone: string;
  utility_name: string;
  utility_phone: string;
  preferred_time: string;
  preferred_days: string[];
  caregiver_name?: string;
  caregiver_phone?: string;
}

export interface CallResult {
  callId: string;
  status: 'in_progress' | 'completed' | 'failed';
  message: string;
  mode: AppMode;
}

export interface TranscriptLine {
  speaker: 'agent' | 'representative';
  text: string;
  timestamp?: string;
}

export interface ScriptVariant {
  opening: string;
  confirm_line: string;
  closing: string;
  pacing: 'slow' | 'normal' | 'fast';
  confirm_twice: boolean;
}

export interface DoorScenario {
  id: string;
  door: DoorType;
  name: string;
  icon: string;
  input: string;
  expected_intent: Omit<Intent, 'mode'>;
  calm: {
    script: ScriptVariant;
    transcript: string[];
    summary: string;
  };
  power: {
    script: ScriptVariant;
    transcript: string[];
    summary: string;
  };
}
