import axios from 'axios';
import React, { useState } from 'react';

export function TelegramLink() {
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/telegram/link-url', {
        withCredentials: true,
      });
      setLinkUrl(response.data.linkUrl);
    } catch (error) {
      console.error('Error generating Telegram link:', error);
      alert('Failed to generate Telegram link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16, padding: '1rem', border: '1px solid #ccc', borderRadius: 8 }}>
      <h3>Telegram Notifications</h3>
      {!linkUrl ? (
        <button onClick={generateLink} disabled={loading}>
          {loading ? 'Generating...' : 'Link Telegram Bot'}
        </button>
      ) : (
        <div>
          <p>Click the link below to open Telegram and start the bot:</p>
          <a href={linkUrl} target="_blank" rel="noopener noreferrer">
            {linkUrl}
          </a>
          <p style={{ fontSize: 12, color: '#666' }}>
            After starting the bot in Telegram, you will receive dose confirmations here.
          </p>
        </div>
      )}
    </div>
  );
}
