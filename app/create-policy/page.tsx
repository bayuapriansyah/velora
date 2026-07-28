"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepIndicator } from "@/components/create-policy/step-indicator";
import { Step1Info } from "@/components/create-policy/step1-info";
import { Step2Permissions } from "@/components/create-policy/step2-permissions";
import { Step3Limits } from "@/components/create-policy/step3-limits";
import { Step4Review } from "@/components/create-policy/step4-review";
import { DEFAULT_FORM_STATE, PolicyFormState } from "@/components/create-policy/form-types";
import { useWallet } from "@/hooks/useWallet";
import { useVeloraContract } from "@/hooks/useVeloraContract";
import { botToWei } from "@/lib/format";

function validateStep(step: number, form: PolicyFormState): string | null {
  if (step === 1) {
    if (!form.name.trim()) return "Give this policy a name.";
    if (!form.budget || Number(form.budget) <= 0) return "Enter a budget greater than 0.";
  }
  if (step === 2) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(form.destination)) return "Enter a valid destination address.";
  }
  if (step === 3) {
    if (form.expirationHours <= 0) return "Expiration must be in the future.";
    if (form.maxExecutions <= 0) return "Max executions must be at least 1.";
  }
  return null;
}

export default function CreatePolicyPage() {
  const router = useRouter();
  const { account, isCorrectNetwork, connect } = useWallet();
  const { createPolicy } = useVeloraContract();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PolicyFormState>(DEFAULT_FORM_STATE);
  const [error, setError] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  function onChange(patch: Partial<PolicyFormState>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function next() {
    const err = validateStep(step, form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(4, s + 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function deploy() {
    setIsDeploying(true);
    setError(null);
    try {
      const expirationUnix = Math.floor(Date.now() / 1000) + form.expirationHours * 3600;
      await createPolicy({
        name: form.name,
        allowedDestination: form.destination,
        allowedAction: form.action,
        expiration: expirationUnix,
        maxExecutions: form.maxExecutions,
        depositWei: botToWei(form.budget),
      });
      setDeployed(true);
      setTimeout(() => router.push("/dashboard"), 1600);
    } catch (err: any) {
      setError(err?.shortMessage ?? err?.message ?? "Failed to deploy policy.");
    } finally {
      setIsDeploying(false);
    }
  }

  if (!account) {
    return (
      <div className="flex min-h-screen bg-[var(--color-paper)]">
        <Sidebar />
        <div className="lg:ml-[280px] flex flex-1 flex-col">
          <TopBar title="Create Policy" />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="font-medium text-[var(--color-ink)]">Connect your wallet to create a policy.</p>
              <Button className="mt-4" onClick={connect}>
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex min-h-screen bg-[var(--color-paper)]">
        <Sidebar />
      <div className="lg:lg:ml-[280px] flex flex-1 flex-col">
        <TopBar title="Create Policy" />
        <div className="flex flex-1 items-center justify-center">
          <p className="font-medium text-[var(--color-danger)]">Switch to BOT Chain to create a policy.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      <Sidebar />
      <div className="lg:lg:ml-[280px] flex flex-1 flex-col">
        <TopBar title="Create Policy" />
        <div className="flex flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-6 md:py-8 lg:px-6 lg:py-12">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Create policy</h1>
            <p className="mt-1 text-[var(--color-muted)]">Define exactly what an agent is allowed to do. One transaction, immutable.</p>

            <div className="mt-10">
              <StepIndicator current={step} />

              <Card>
                {deployed ? (
                  <div className="py-8 text-center">
                    <p className="font-semibold text-[var(--color-success)]">Policy deployed</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">Redirecting to your dashboard…</p>
                  </div>
                ) : (
                  <>
                    {step === 1 && <Step1Info form={form} onChange={onChange} />}
                    {step === 2 && <Step2Permissions form={form} onChange={onChange} />}
                    {step === 3 && <Step3Limits form={form} onChange={onChange} />}
                    {step === 4 && <Step4Review form={form} />}

                    {error && <p className="mt-4 text-sm font-medium text-[var(--color-danger)]">{error}</p>}

                    <div className="mt-8 flex items-center justify-between">
                      <Button variant="ghost" onClick={back} disabled={step === 1 || isDeploying}>
                        <ArrowLeft size={16} />
                        Back
                      </Button>
                      {step < 4 ? (
                        <Button onClick={next}>
                          Continue
                          <ArrowRight size={16} />
                        </Button>
                      ) : (
                        <Button onClick={deploy} disabled={isDeploying}>
                          {isDeploying ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Deploying…
                            </>
                          ) : (
                            "Deploy policy"
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
