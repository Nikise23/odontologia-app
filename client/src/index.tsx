import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suprimir el error de ResizeObserver (es un warning conocido de React)
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ResizeObserver loop completed with undelivered notifications')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// También manejar errores no capturados de ResizeObserver
window.addEventListener('error', (event) => {
  if (
    event.message &&
    event.message.includes('ResizeObserver loop completed with undelivered notifications')
  ) {
    event.stopImmediatePropagation();
    return false;
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

