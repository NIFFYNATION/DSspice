import React from 'react';

function decodeHtml(html) {
  const txt = new DOMParser().parseFromString(html, 'text/html');
  return txt.documentElement.textContent;
}

export default function CleanText({ rawText }) {
  const decoded = decodeHtml(rawText);

  return <p>{decoded}</p>;
}
