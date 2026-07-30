import { ActionType } from "@/types/policy";

export interface PolicyFormState {
  name: string;
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
  destination: "",
  action: ActionType.Transfer,
  expirationHours: 24,
  maxExecutions: 3,
  amountPerExecution: "",
  paymentIntervalDays: 30,
  useSeconds: false,
};
