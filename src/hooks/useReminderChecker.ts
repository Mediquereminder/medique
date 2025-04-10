
import { useEffect } from 'react';
import { checkDueMedications, checkMissedMedications } from '@/utils/medicationService';

/**
 * Hook to periodically check for medications that are due or missed
 * and send notifications to patients and caretakers
 */
export function useReminderChecker() {
  useEffect(() => {
    // Check on mount
    checkDueMedications();
    checkMissedMedications();
    
    // Set up intervals to check regularly
    const dueCheckerId = setInterval(() => {
      checkDueMedications();
    }, 30000); // Check every 30 seconds for due medications (increased frequency)
    
    const missedCheckerId = setInterval(() => {
      checkMissedMedications();
    }, 300000); // Check every 5 minutes for missed medications
    
    // Clean up intervals on unmount
    return () => {
      clearInterval(dueCheckerId);
      clearInterval(missedCheckerId);
    };
  }, []);
}
