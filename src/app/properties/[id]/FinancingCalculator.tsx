"use client";

import { useState, useMemo } from "react";
import Input from "@/components/ui/Input";

interface Props {
  purchasePrice: number;
  renovationBudget: number;
}

export default function FinancingCalculator({ purchasePrice, renovationBudget }: Props) {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);
  const [renoAmount, setRenoAmount] = useState(renovationBudget);

  const { monthlyPayment, totalLoan, downPayment } = useMemo(() => {
    const total = purchasePrice + renoAmount;
    const dp = total * (downPaymentPct / 100);
    const loan = total - dp;
    const monthlyRate = rate / 100 / 12;
    const numPayments = termYears * 12;

    if (monthlyRate === 0) {
      return {
        monthlyPayment: loan / numPayments,
        totalLoan: loan,
        downPayment: dp,
      };
    }

    const payment =
      (loan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    return {
      monthlyPayment: payment,
      totalLoan: loan,
      downPayment: dp,
    };
  }, [purchasePrice, renoAmount, downPaymentPct, rate, termYears]);

  function formatCurrency(n: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-navy-light/40 p-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-light">
              Purchase Price
            </label>
            <div className="text-lg font-bold text-warm-white">{formatCurrency(purchasePrice)}</div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-light">
              Renovation Budget
            </label>
            <Input
              type="number"
              value={renoAmount}
              onChange={(e) => setRenoAmount(Number(e.target.value))}
              step={5000}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <label className="font-medium text-slate-light">Down Payment</label>
              <span className="font-semibold text-warm-white">{downPaymentPct}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full accent-copper"
            />
            <div className="mt-1 flex justify-between text-xs text-slate">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-light">
                Interest Rate (%)
              </label>
              <Input
                type="number"
                step={0.125}
                min={1}
                max={15}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-light">
                Loan Term
              </label>
              <select
                value={termYears}
                onChange={(e) => setTermYears(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-navy-light/60 px-4 py-3 text-warm-white focus:border-copper/60 focus:outline-none focus:ring-1 focus:ring-copper/40"
              >
                <option value={15}>15 years</option>
                <option value={20}>20 years</option>
                <option value={30}>30 years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col justify-center rounded-xl border border-copper/20 bg-gradient-to-b from-copper/5 to-transparent p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-copper">
            Estimated Monthly Payment
          </p>
          <p className="mt-2 text-4xl font-bold text-warm-white md:text-5xl">
            {formatCurrency(monthlyPayment)}
          </p>
          <p className="mt-1 text-sm text-slate">/month</p>

          <div className="mt-8 space-y-3 border-t border-white/5 pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-light">Total Property + Renovation</span>
              <span className="font-medium">{formatCurrency(purchasePrice + renoAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-light">Down Payment ({downPaymentPct}%)</span>
              <span className="font-medium">{formatCurrency(downPayment)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-light">Loan Amount</span>
              <span className="font-semibold text-copper">{formatCurrency(totalLoan)}</span>
            </div>
          </div>

          <p className="mt-6 text-xs text-slate">
            Estimate only. Does not include taxes, insurance, or PMI. Consult a lender for actual rates.
          </p>
        </div>
      </div>
    </div>
  );
}
