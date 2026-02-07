import { ReapReport } from '../types';

const STORAGE_KEY = 'reap_reports';

export const getReapReports = (): ReapReport[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveReapReport = (report: ReapReport): void => {
    const reports = getReapReports();
    const existingIndex = reports.findIndex(r => r.id === report.id);

    if (existingIndex >= 0) {
        reports[existingIndex] = report;
    } else {
        reports.push(report);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const deleteReapReport = (id: string): void => {
    const reports = getReapReports();
    const filtered = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const createNewReapId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
