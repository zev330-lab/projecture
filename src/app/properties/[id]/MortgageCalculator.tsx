"use client";

import { useState, useMemo } from "react";
import Input from "@/components/ui/Input";

interface Props {
  price: number;
}

export default function MortgageCalculator({ price }: Props) {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);

  const { monthlyPayment, totalLoan, downPayment } = useMemo(() => {
    const dp = price * (downPaymentPct / 100);
    const loan = price - dp;
    const monthlyRate = rate / 100 / 12;
    const numPayments = termYears * 12;

    if (monthlyRate === 0) {
      return { monthlyPayment: loan / numPayments, totalLoan: loan, downPayment: dp };
    }

    const payment =
      (loan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    return { monthlyPayment: payment, totalLoan: loan, downPayment: dp };
  }, [price, downPaymentPct, rate, termYears]);

  function fmt(n: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  }

  return (
    <div className="rounded-xl border border-stone/10 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <label className="font-medium text-stone">Down Payment</label>
            <span className="font-semibold text-navy">{downPaymentPct}%</span>
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
          <div className="mt-1 flex justify-between text-xs text-stone-lighter">
            <span>5%</span>
            <span>50%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone">Rate (%)</label>
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
            <label className="mb-1.5 block text-sm font-medium text-stone">Term</label>
            <select
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value))}
              className="w-full rounded-lg border border-stone/20 bg-white px-4 py-3 text-navy focus:border-copper focus:outline-none focus:ring-1 focus:ring-copper/40"
            >
              <option value={15}>15 years</option>
              <option value={20}>20 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-copper/20 bg-gradient-to-b from-copper/5 to-transparent p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-copper">
          Est. Monthly Payment
        </p>
        <p className="mt-1 text-3xl font-bold text-navy">
          {fmt(monthlyPayment)}
        </p>

        <div className="mt-4 space-y-2 border-t border-stone/10 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-stone-light">Down Payment ({downPaymentPct}%)</span>
            <span className="font-medium text-navy">{fmt(downPayment)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-light">Loan Amount</span>
            <span className="font-semibold text-copper">{fmt(totalLoan)}</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-stone-lighter">
          Estimate only. Does not include taxes, insurance, or PMI.
        </p>
      </div>
    </div>
  );
}
