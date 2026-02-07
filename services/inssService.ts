import { InssContribution } from '../types';

const STORAGE_KEY = 'inss_contributions';

export const getInssContributions = (): InssContribution[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveInssContribution = (contribution: InssContribution): void => {
    const records = getInssContributions();
    const existingIndex = records.findIndex(r => r.id === contribution.id);

    if (existingIndex >= 0) {
        records[existingIndex] = contribution;
    } else {
        records.push(contribution);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const deleteInssContribution = (id: string): void => {
    const records = getInssContributions();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const createNewInssId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
