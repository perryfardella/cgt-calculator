"use client";

import { useState } from "react";

enum EntityType {
  IndividualOrTrust = "individualOrTrust",
  SMSF = "smsf",
}

export default function Home() {
  const [values, setValues] = useState({
    priorLosses: "",
    shortTermGains: "",
    longTermGains: "",
  });

  const [computedValues, setComputedValues] = useState({
    grossGains: "",
    discount: "",
    netGains: "",
    lossesForward: "",
  });

  const [selectedEntity, setSelectedEntity] = useState(
    EntityType.IndividualOrTrust
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9.]/g, "");
    const newValues = { ...values, [name]: numericValue };
    setValues(newValues);
    updateComputedValues(newValues);
  };

  const updateComputedValues = (newValues: typeof values) => {
    const priorLosses = parseFloat(newValues.priorLosses) || 0;
    const shortTermGains = parseFloat(newValues.shortTermGains) || 0;
    const longTermGains = parseFloat(newValues.longTermGains) || 0;

    const grossGains = shortTermGains + longTermGains - priorLosses;
    const discountRate =
      selectedEntity === EntityType.IndividualOrTrust ? 0.5 : 0.33;
    const discount = grossGains > 0 ? grossGains * discountRate : 0;
    const netGains = grossGains > 0 ? grossGains - discount : 0;
    const lossesForward = grossGains < 0 ? -grossGains : 0;

    setComputedValues({
      grossGains: grossGains.toFixed(2),
      discount: discount.toFixed(2),
      netGains: netGains.toFixed(2),
      lossesForward: lossesForward.toFixed(2),
    });
  };

  const handleEntityChange = (newEntity: EntityType) => {
    setSelectedEntity(newEntity);
    updateComputedValues(values);
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    const number = parseFloat(value);
    return isNaN(number)
      ? ""
      : new Intl.NumberFormat("en-AU", {
          style: "currency",
          currency: "AUD",
          minimumFractionDigits: 2,
        }).format(number);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1>Australian CGT Tax Calculator</h1>
      <div className="join">
        <input
          className="join-item btn"
          type="radio"
          name="options"
          aria-label="Individual / Trust"
          checked={selectedEntity === EntityType.IndividualOrTrust}
          onChange={() => handleEntityChange(EntityType.IndividualOrTrust)}
        />
        <input
          className="join-item btn"
          type="radio"
          name="options"
          aria-label="SMSF"
          checked={selectedEntity === EntityType.SMSF}
          onChange={() => handleEntityChange(EntityType.SMSF)}
        />
      </div>
      <div className="flex flex-col gap-4">
        {/* Editable inputs */}
        {[
          {
            name: "priorLosses",
            label: "Unapplied capital losses from prior years",
          },
          { name: "shortTermGains", label: "Short term capital gains" },
          { name: "longTermGains", label: "Long term capital gains" },
        ].map((field) => (
          <label key={field.name} className="form-control w-full max-w-xs">
            <span className="label-text">{field.label}</span>
            <input
              type="text"
              name={field.name}
              value={formatCurrency(values[field.name as keyof typeof values])}
              onChange={handleInputChange}
              placeholder="$0.00"
              className="input input-bordered w-full max-w-xs"
            />
          </label>
        ))}

        {/* Computed (disabled) inputs */}
        {[
          { name: "grossGains", label: "Gross capital gains" },
          { name: "discount", label: "Capital gain discount" },
          { name: "netGains", label: "Net capital gains" },
          {
            name: "lossesForward",
            label: "Capital losses carried forward to future years",
          },
        ].map((field) => (
          <label key={field.name} className="form-control w-full max-w-xs">
            <span className="label-text">{field.label}</span>
            <input
              type="text"
              name={field.name}
              value={formatCurrency(
                computedValues[field.name as keyof typeof computedValues]
              )}
              readOnly
              disabled
              className="input input-bordered w-full max-w-xs"
            />
          </label>
        ))}
      </div>
    </main>
  );
}
