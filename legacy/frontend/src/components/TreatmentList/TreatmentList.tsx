import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface Treatment {
  id: number;
  name: string;
  interval: number;
  medicine: Array<{ name: string; dosage: string; quantity: string }>;
  slug: string;
  createdAt: string;
}

export function TreatmentList() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [doses, setDoses] = useState<{ [key: number]: any[] }>({});

  const fetchTreatments = async () => {
    try {
      const response = await axios.get('/treatments', {
        withCredentials: true,
      });
      setTreatments(response.data);
    } catch (error) {
      console.error('Error fetching treatments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoses = async (id: number) => {
    try {
      const response = await axios.get(`/treatments/${id}/doses`, {
        withCredentials: true,
      });
      setDoses((prev) => ({ ...prev, [id]: response.data }));
    } catch (error) {
      console.error('Error fetching doses:', error);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  if (loading) return <p>Loading treatments...</p>;
  if (treatments.length === 0) return <p>No treatments yet. Create one below!</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: 600 }}>
      <h2>Your Treatments</h2>
      {treatments.map((t) => (
        <div
          key={t.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: '1rem',
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{t.name}</h3>
            <span style={{ fontSize: 12, color: '#666' }}>Every {t.interval}h</span>
          </div>

          <div style={{ marginTop: 8 }}>
            {t.medicine.map((m, idx) => (
              <div key={idx} style={{ fontSize: 14, color: '#444' }}>
                {m.name} — {m.dosage} ({m.quantity} pills)
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                setSelectedId(selectedId === t.id ? null : t.id);
                if (selectedId !== t.id) fetchDoses(t.id);
              }}
            >
              {selectedId === t.id ? 'Hide QR' : 'Show QR'}
            </button>
            <button onClick={() => fetchDoses(t.id)}>Refresh History</button>
          </div>

          {selectedId === t.id && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <img
                src={`/treatments/${t.id}/qr`}
                alt={`QR for ${t.name}`}
                style={{ maxWidth: 200, border: '1px solid #ddd', borderRadius: 4 }}
              />
              <p style={{ fontSize: 12, color: '#666', wordBreak: 'break-all' }}>
                Scan to confirm dose
              </p>
            </div>
          )}

          {doses[t.id] && doses[t.id].length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 14 }}>Dose History</h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#555' }}>
                {doses[t.id].map((d) => (
                  <li key={d.id}>
                    {new Date(d.createdAt).toLocaleString()} — {d.confirmedVia === 'qr_scan' ? 'QR Scan' : 'Manual'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
