"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Medicine = {
  name: string;
  dosage: string;
  quantity: string;
};

type Treatment = {
  id: string;
  name: string;
  interval: number;
  medicine: Medicine[];
  slug: string;
  createdAt: string;
};

export default function TreatmentsPage() {
  const router = useRouter();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [interval, setInterval] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", dosage: "", quantity: "" },
  ]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/treatments");
        if (cancelled) return;
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!cancelled) setTreatments(data);
      } catch {
        if (!cancelled) setError("Failed to load treatments");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [router]);

  function addMedicine() {
    setMedicines([...medicines, { name: "", dosage: "", quantity: "" }]);
  }

  function removeMedicine(index: number) {
    setMedicines(medicines.filter((_, i) => i !== index));
  }

  function updateMedicine(index: number, field: keyof Medicine, value: string) {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/treatments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          interval: Number(interval),
          medicines,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create treatment");
        return;
      }

      const created = await res.json();
      setName("");
      setInterval("");
      setMedicines([{ name: "", dosage: "", quantity: "" }]);
      setShowForm(false);
      setTreatments((prev) => [created, ...prev]);
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Treatments
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {showForm ? "Cancel" : "New Treatment"}
          </button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Create Treatment
            </h2>

            <div className="mb-4">
              <label
                htmlFor="treatment-name"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Name
              </label>
              <input
                id="treatment-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="e.g. Antibiotics"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="treatment-interval"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Interval (hours)
              </label>
              <input
                id="treatment-interval"
                type="number"
                required
                min="1"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="e.g. 8"
              />
            </div>

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Medicines
                </span>
                <button
                  type="button"
                  onClick={addMedicine}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  + Add medicine
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {medicines.map((med, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-700"
                  >
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        required
                        value={med.name}
                        onChange={(e) =>
                          updateMedicine(i, "name", e.target.value)
                        }
                        className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        required
                        value={med.dosage}
                        onChange={(e) =>
                          updateMedicine(i, "dosage", e.target.value)
                        }
                        className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        placeholder="Dosage"
                      />
                      <input
                        type="text"
                        required
                        value={med.quantity}
                        onChange={(e) =>
                          updateMedicine(i, "quantity", e.target.value)
                        }
                        className="flex-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        placeholder="Quantity"
                      />
                    </div>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(i)}
                        className="mt-1 text-sm text-zinc-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {submitting ? "Creating..." : "Create Treatment"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Loading treatments...</p>
        ) : treatments.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">
              No treatments yet. Create your first one.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {treatments.map((treatment) => (
              <div
                key={treatment.id}
                className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                    {treatment.name}
                  </h3>
                  <span className="text-xs text-zinc-500">
                    Every {treatment.interval}h
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {treatment.medicine.map((med, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      {med.name} &middot; {med.dosage} &middot; x{med.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
