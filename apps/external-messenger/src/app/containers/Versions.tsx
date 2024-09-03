import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

import './Versions.scss';

const Versions = (props) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('mounting');
  const [versions, setVersions] = useState(null);

  const fetchVersions = () => {
    setLoading(true);
    setMsg('loading');
    setVersions(null);

    axios.get('/versions/').then((response) => {
      const visibleVersions = response.data.filter(
        (version) => version.name.indexOf('qa-') !== -1
      );
      setVersions(visibleVersions);
      setLoading(false);
      setMsg(null);
    });
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  // Function to sanitize URL
  function sanitizeUrl(url:string):string {
    const safeDomain = 'amsconnectapp.com'; // Define safe domain
    const safePrefix = 'https://'; // Define safe prefix
    // Check if URL starts with a safe prefix and contains the safe domain
    const isSafe = url.startsWith(safePrefix) && url.includes(safeDomain);
    // Regular expression for unsafe characters in the URL (excluding hash)
    const unsafeCharacters = /[^\w\d\-._~:/?[\]@!$&'()*+,;=%]/;
    // Check for unsafe characters in the URL (excluding hash)
    const hasUnsafeCharacters = unsafeCharacters.test(url);
    // Return the original URL if it's safe and doesn't contain unsafe characters
    return isSafe && !hasUnsafeCharacters ? url : '';
  }

  // Memoize the sanitized URL function
  const getUrl = useMemo(() => (versionName:string) => sanitizeUrl(`/version/${versionName}`), []);

  if (msg) {
    return (
      <main className="versions">
        <h1 className="versions__heading">Versions</h1>
        <p className="versions__msg">
          {msg}
          <span className="versions__elli">…</span>
        </p>
      </main>
    );
  }

  return (
    <main className="versions">
      <h1 className="versions__heading">Versions</h1>
      <ul className="versions__list">
        {versions.map((version) => (
          <li key={version.name} className="version">
            <a className="version__link" href={getUrl(version.name)}>
              {version.name}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Versions;

