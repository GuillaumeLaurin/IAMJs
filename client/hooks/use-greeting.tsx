'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

const MIN_MORNING = 5;
const MAX_MORNING = 12;
const MAX_AFTERNOON = 18;

const MILISECONDS = 1000;
const SECONDS = 60;

const useGreeting = () => {
  const getGreeting = () => {
    const t = useTranslations('greeting');
    const hour = new Date().getHours();

    if (hour >= MIN_MORNING && hour < MAX_MORNING) {
      return t('morning');
    } else if (hour >= MAX_MORNING && hour < MAX_AFTERNOON) {
      return t('afternoon');
    } else {
      return t('evening');
    }
  };

  const [greeting, setGreeting] = useState(getGreeting);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, SECONDS * MILISECONDS);

    return () => clearInterval(interval);
  }, []);

  return greeting;
};

export default useGreeting;
