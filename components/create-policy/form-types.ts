import { ActionType } from "@/types/policy";

export interface PolicyFormState {
  name: string;
  budget: string; // BOT, as typed
  destination: string;
  action: ActionType;
  expirationHours: number;
  maxExecutions: number;
  amountPerExecution: string;
  paymentIntervalDays: number;
  useSeconds: boolean;
}

export const DEFAULT_FORM_STATE: PolicyFormState = {
  name: "",
  budget: "",
  destination: "",
  action: ActionType.Transfer,
  expirationHours: 24,
  maxExecutions: 3,
  amountPerExecution: "",
  paymentIntervalDays: 30, // Default to 30 days (Monthly)
  useSeconds: false,
};
