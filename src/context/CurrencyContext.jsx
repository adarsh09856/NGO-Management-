import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

export const SUPPORTED_CURRENCIES = {
  BTN: { code: 'BTN', symbol: 'Nu.', name: 'Bhutanese Ngultrum' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' }
};

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('BTN');
  const [currencySymbol, setCurrencySymbol] = useState('Nu.');
  const [currencyName, setCurrencyName] = useState('Bhutanese Ngultrum');
  const [loading, setLoading] = useState(true);

  const applyCurrency = (code, customSymbol = null, customName = null) => {
    const cleanCode = (code || 'BTN').toUpperCase().trim();
    const preset = SUPPORTED_CURRENCIES[cleanCode];

    const finalSymbol = customSymbol || preset?.symbol || cleanCode;
    const finalName = customName || preset?.name || cleanCode;

    setCurrency(cleanCode);
    setCurrencySymbol(finalSymbol);
    setCurrencyName(finalName);
  };

  const loadCurrencySettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.success && res.data.data) {
        const s = res.data.data;
        const code = s.default_currency || s.currency || 'BTN';
        const symbol = s.currency_symbol || null;
        const name = s.currency_name || null;
        applyCurrency(code, symbol, name);
      }
    } catch (err) {
      console.warn('CurrencyContext: Failed to load currency settings, using fallback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrencySettings();
  }, [loadCurrencySettings]);

  // Format amount with active currency symbol
  const formatAmount = useCallback((amount, showCode = false) => {
    const num = Number(amount) || 0;
    const formattedNum = num.toLocaleString('en-IN');
    if (showCode) {
      return `${currencySymbol} ${formattedNum} ${currency}`;
    }
    return `${currencySymbol} ${formattedNum}`;
  }, [currency, currencySymbol]);

  const value = useMemo(() => ({
    currency,
    currencySymbol,
    currencyName,
    loading,
    formatAmount,
    refreshCurrency: loadCurrencySettings,
    setCurrencyDirectly: applyCurrency,
    SUPPORTED_CURRENCIES
  }), [currency, currencySymbol, currencyName, loading, formatAmount, loadCurrencySettings]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      currency: 'BTN',
      currencySymbol: 'Nu.',
      currencyName: 'Bhutanese Ngultrum',
      loading: false,
      formatAmount: (amt) => `Nu. ${(Number(amt) || 0).toLocaleString('en-IN')}`,
      refreshCurrency: () => {},
      setCurrencyDirectly: () => {},
      SUPPORTED_CURRENCIES
    };
  }
  return context;
}
