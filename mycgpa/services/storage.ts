import { AcademicRecord, Semester } from '../types';

const STORAGE_KEY = 'honours_gpa_data_v1';

const getInitialData = (): AcademicRecord => ({
  semesters: [],
  lastUpdated: new Date().toISOString(),
});

export const saveRecord = (record: AcademicRecord): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch (error) {
    console.error('Failed to save data to local storage', error);
  }
};

export const loadRecord = (): AcademicRecord => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getInitialData();
  } catch (error) {
    console.error('Failed to load data from local storage', error);
    return getInitialData();
  }
};

export const exportData = (): string => {
  const record = loadRecord();
  return JSON.stringify(record, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && Array.isArray(parsed.semesters)) {
      saveRecord(parsed);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};