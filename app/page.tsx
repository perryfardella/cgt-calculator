"use client";

import { useState } from "react";

enum EntityType {
  IndividualOrTrust = "individualOrTrust",
  SMSF = "smsf",
  Company = "company",
}

// TODO: Add a field for current year capital losses
// Add a reset button
// Add a prompt, over 10K gain or loss? you need a cgt schedule, I'm build software to assist with this, would you be interested --> take to Typeform, see if I get interest
// Write first blog article, tweet it.

export default function Home() {
  const [values, setValues] = useState({
    priorLosses: "",
    currentYearLosses: "",
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

  const updateComputedValues = (
    newValues: typeof values,
    entityType: EntityType = selectedEntity
  ) => {
    const parseCurrencyValue = (value: string) => {
      // Remove currency symbol, commas, and any other non-numeric characters except decimal point
      const cleanedValue = value.replace(/[^0-9.-]/g, "");
      return parseFloat(cleanedValue) || 0;
    };

    const priorLosses = parseCurrencyValue(newValues.priorLosses);
    const currentYearLosses = parseCurrencyValue(newValues.currentYearLosses);
    const shortTermGains = parseCurrencyValue(newValues.shortTermGains);
    const longTermGains = parseCurrencyValue(newValues.longTermGains);

    console.log("Parsed values:", {
      priorLosses,
      currentYearLosses, // Added logging
      shortTermGains,
      longTermGains,
    });

    const totalLosses = priorLosses + currentYearLosses;
    const remainingLosses = Math.max(totalLosses - shortTermGains, 0);
    const longTermGainsAfterLosses = Math.max(
      longTermGains - remainingLosses,
      0
    );
    const grossGains = shortTermGains + longTermGains - totalLosses;

    const discountRate =
      entityType === EntityType.IndividualOrTrust
        ? 0.5
        : entityType === EntityType.SMSF
        ? 0.3333
        : 0; // 0% discount for Company
    const discount = longTermGainsAfterLosses * discountRate;
    const netGains = Math.max(grossGains - discount, 0);
    const lossesForward = grossGains < 0 ? grossGains : 0;

    setComputedValues({
      grossGains: grossGains.toFixed(2),
      discount: discount.toFixed(2),
      netGains: netGains.toFixed(2),
      lossesForward: lossesForward.toFixed(2),
    });
  };

  const handleEntityChange = (newEntity: EntityType) => {
    setSelectedEntity(newEntity);
    updateComputedValues(values, newEntity);
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

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9.]/g, "");
    setValues((prev) => ({ ...prev, [name]: numericValue }));
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9.]/g, "");
    const formattedValue = formatCurrency(numericValue);
    setValues((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleReset = () => {
    setValues({
      priorLosses: "",
      currentYearLosses: "",
      shortTermGains: "",
      longTermGains: "",
    });
    setComputedValues({
      grossGains: "",
      discount: "",
      netGains: "",
      lossesForward: "",
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 gap-8">
      <h1>Australian Capital Gains Tax calculator</h1>
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
        <input
          className="join-item btn"
          type="radio"
          name="options"
          aria-label="Company"
          checked={selectedEntity === EntityType.Company}
          onChange={() => handleEntityChange(EntityType.Company)}
        />
      </div>
      <div className="flex flex-col gap-4">
        {/* Editable inputs */}
        {[
          {
            name: "priorLosses",
            label: "Unapplied capital losses from prior years",
          },
          {
            name: "currentYearLosses",
            label: "Current year capital losses",
          },
          { name: "shortTermGains", label: "Short term capital gains" },
          { name: "longTermGains", label: "Long term capital gains" },
        ].map((field) => (
          <label
            key={field.name}
            className="form-control w-full max-w-xs gap-1"
          >
            <span className="label-text">{field.label}</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                $
              </span>
              <input
                type="text"
                name={field.name}
                value={values[field.name as keyof typeof values].replace(
                  "$",
                  ""
                )}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="0.00"
                className="input input-bordered w-full max-w-xs pl-6"
              />
            </div>
          </label>
        ))}

        {/* Computed (disabled) inputs */}
        {[
          { name: "grossGains", label: "Gross capital gain / (loss)" },
          { name: "discount", label: "Capital gain discount" },
          { name: "netGains", label: "Net capital gains" },
          {
            name: "lossesForward",
            label: "Capital losses carried forward to future years",
          },
        ].map((field) => (
          <label
            key={field.name}
            className="form-control w-full max-w-xs gap-1"
          >
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
      <button className="btn btn-primary" onClick={handleReset}>
        Reset
      </button>
    </main>
  );
}
