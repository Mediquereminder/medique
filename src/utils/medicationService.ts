
import { format, addDays, isAfter, isBefore, parseISO } from "date-fns";

// Types for our medication system
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // daily, twice-daily, weekly, etc.
  time: string; // For specific time of day, e.g., "08:00"
  startDate: string;
  endDate?: string;
  description?: string;
  patientId: string;
  createdBy: string;
  active: boolean;
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  scheduledTime: string; // ISO string
  patientId: string;
  taken: boolean;
  skipped: boolean;
  takenTime?: string; // ISO string, when medication was taken
}

// Get all medications for a user (either as patient directly or as caretaker)
export const getUserMedications = (userId: string) => {
  const medications = JSON.parse(localStorage.getItem("medications") || "[]");
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const currentUser = users.find((user: any) => user.userId === userId);
  
  if (!currentUser) return [];
  
  if (currentUser.role === "patient") {
    // If patient, return medications assigned to this patient
    return medications.filter((med: Medication) => med.patientId === userId);
  } else {
    // If caretaker, return medications created by this caretaker
    // as well as medications for patients connected to this caretaker
    const patientIds = currentUser.connectedPatients || [];
    return medications.filter((med: Medication) => 
      med.createdBy === userId || 
      (patientIds.includes(med.patientId) && med.active)
    );
  }
};

// Get upcoming medication schedules
export const getUpcomingSchedules = (userId: string) => {
  const schedules = JSON.parse(localStorage.getItem("medicationSchedules") || "[]");
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const currentUser = users.find((user: any) => user.userId === userId);
  
  if (!currentUser) return [];
  
  const now = new Date();
  
  if (currentUser.role === "patient") {
    // If patient, return schedules assigned to this patient
    return schedules
      .filter((schedule: MedicationSchedule) => 
        schedule.patientId === userId &&
        !schedule.taken && 
        !schedule.skipped && 
        isAfter(parseISO(schedule.scheduledTime), now)
      )
      .sort((a: MedicationSchedule, b: MedicationSchedule) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      );
  } else {
    // If caretaker, return schedules for patients connected to this caretaker
    const patientIds = currentUser.connectedPatients || [];
    return schedules
      .filter((schedule: MedicationSchedule) => 
        (patientIds.includes(schedule.patientId) || schedule.patientId === userId) &&
        !schedule.taken && 
        !schedule.skipped && 
        isAfter(parseISO(schedule.scheduledTime), now)
      )
      .sort((a: MedicationSchedule, b: MedicationSchedule) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      );
  }
};

// Get today's medication schedules
export const getTodaySchedules = (userId: string) => {
  const schedules = JSON.parse(localStorage.getItem("medicationSchedules") || "[]");
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const currentUser = users.find((user: any) => user.userId === userId);
  
  if (!currentUser) return [];
  
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  
  if (currentUser.role === "patient") {
    // If patient, return schedules assigned to this patient
    return schedules
      .filter((schedule: MedicationSchedule) => 
        schedule.patientId === userId &&
        schedule.scheduledTime.startsWith(today)
      )
      .sort((a: MedicationSchedule, b: MedicationSchedule) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      );
  } else {
    // If caretaker, return schedules for patients connected to this caretaker
    const patientIds = currentUser.connectedPatients || [];
    return schedules
      .filter((schedule: MedicationSchedule) => 
        (patientIds.includes(schedule.patientId) || schedule.patientId === userId) &&
        schedule.scheduledTime.startsWith(today)
      )
      .sort((a: MedicationSchedule, b: MedicationSchedule) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      );
  }
};

// Add a new medication
export const addMedication = (medication: Omit<Medication, "id">) => {
  const medications = JSON.parse(localStorage.getItem("medications") || "[]");
  
  const newMedication: Medication = {
    ...medication,
    id: Date.now().toString(),
    active: true
  };
  
  medications.push(newMedication);
  localStorage.setItem("medications", JSON.stringify(medications));
  
  // Generate the schedules for this medication
  generateSchedules(newMedication);
  
  // Add notification for the patient
  addNotification(medication.patientId, {
    title: "New Medication Added",
    message: `${medication.name} (${medication.dosage}) has been added to your schedule. First dose at ${medication.time}.`,
    timestamp: new Date().toISOString(),
    type: "medication-added",
    read: false
  });
  
  return newMedication;
};

// Generate schedules for a medication (for the next 7 days)
const generateSchedules = (medication: Medication) => {
  const schedules = JSON.parse(localStorage.getItem("medicationSchedules") || "[]");
  const newSchedules: MedicationSchedule[] = [];
  
  const startDate = parseISO(medication.startDate);
  const endDate = medication.endDate ? parseISO(medication.endDate) : addDays(new Date(), 30); // Default to 30 days if no end date
  
  // Generate schedules based on frequency
  let currentDate = new Date(startDate);
  
  while (isBefore(currentDate, endDate)) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    
    // Handle different frequencies
    if (medication.frequency === "daily") {
      newSchedules.push({
        id: `${medication.id}-${dateStr}`,
        medicationId: medication.id,
        scheduledTime: `${dateStr}T${medication.time}:00`,
        patientId: medication.patientId,
        taken: false,
        skipped: false
      });
    } else if (medication.frequency === "twice-daily") {
      // Morning dose (use the time provided)
      newSchedules.push({
        id: `${medication.id}-${dateStr}-morning`,
        medicationId: medication.id,
        scheduledTime: `${dateStr}T${medication.time}:00`,
        patientId: medication.patientId,
        taken: false,
        skipped: false
      });
      
      // Evening dose (12 hours later)
      const [hours, minutes] = medication.time.split(":");
      const eveningHours = (parseInt(hours) + 12) % 24;
      const eveningTime = `${eveningHours.toString().padStart(2, "0")}:${minutes}`;
      
      newSchedules.push({
        id: `${medication.id}-${dateStr}-evening`,
        medicationId: medication.id,
        scheduledTime: `${dateStr}T${eveningTime}:00`,
        patientId: medication.patientId,
        taken: false,
        skipped: false
      });
    } else if (medication.frequency === "weekly") {
      // Only add if this is the same day of week as the start date
      if (format(currentDate, "E") === format(startDate, "E")) {
        newSchedules.push({
          id: `${medication.id}-${dateStr}`,
          medicationId: medication.id,
          scheduledTime: `${dateStr}T${medication.time}:00`,
          patientId: medication.patientId,
          taken: false,
          skipped: false
        });
      }
    }
    
    // Move to next day
    currentDate = addDays(currentDate, 1);
  }
  
  // Add new schedules to existing ones
  localStorage.setItem("medicationSchedules", JSON.stringify([...schedules, ...newSchedules]));
};

// Mark a medication as taken
export const markMedicationTaken = (scheduleId: string) => {
  const schedules = JSON.parse(localStorage.getItem("medicationSchedules") || "[]");
  const medications = JSON.parse(localStorage.getItem("medications") || "[]");
  
  const updatedSchedules = schedules.map((schedule: MedicationSchedule) => {
    if (schedule.id === scheduleId) {
      // Find the medication details
      const medication = medications.find((med: Medication) => med.id === schedule.medicationId);
      
      // Create history entry
      addHistoryEntry({
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        medicine: medication?.name || "Unknown medication",
        quantity: medication?.dosage || "1",
        patientId: schedule.patientId,
        taken: true
      });
      
      // Add notification for caretakers
      notifyCaretakers(schedule.patientId, {
        title: "Medication Taken",
        message: `${medication?.name || "Medication"} (${medication?.dosage || ""}) has been taken.`,
        timestamp: new Date().toISOString(),
        type: "medication-taken",
        read: false
      });
      
      return {
        ...schedule,
        taken: true,
        takenTime: new Date().toISOString()
      };
    }
    return schedule;
  });
  
  localStorage.setItem("medicationSchedules", JSON.stringify(updatedSchedules));
  
  // Update medication stock
  updateMedicationStock(scheduleId);
  
  return updatedSchedules.find((schedule: MedicationSchedule) => schedule.id === scheduleId);
};

// Update medication stock when medication is taken
const updateMedicationStock = (scheduleId: string) => {
  const schedules = JSON.parse(localStorage.getItem("medicationSchedules") || "[]");
  const medications = JSON.parse(localStorage.getItem("medications") || "[]");
  const medicationStock = JSON.parse(localStorage.getItem("medicationStock") || "[]");
  
  const schedule = schedules.find((s: MedicationSchedule) => s.id === scheduleId);
  if (!schedule) return;
  
  const medication = medications.find((m: Medication) => m.id === schedule.medicationId);
  if (!medication) return;
  
  // Find the corresponding stock item
  const stockItem = medicationStock.find((item: any) => 
    item.name.toLowerCase() === medication.name.toLowerCase() && 
    item.patientId === schedule.patientId
  );
  
  if (stockItem) {
    // Decrease quantity by 1
    stockItem.quantity = Math.max(0, stockItem.quantity - 1);
    stockItem.lastUpdated = new Date().toISOString().split('T')[0];
    
    localStorage.setItem("medicationStock", JSON.stringify(medicationStock));
  }
};

// Add a notification for a user
export const addNotification = (userId: string, notification: any) => {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const userIndex = users.findIndex((user: any) => user.userId === userId);
  
  if (userIndex !== -1) {
    users[userIndex].notifications = [
      notification,
      ...(users[userIndex].notifications || [])
    ];
    
    localStorage.setItem("users", JSON.stringify(users));
  }
};

// Notify all caretakers connected to a patient
export const notifyCaretakers = (patientId: string, notification: any) => {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  
  // Find patient's caretakers
  const patient = users.find((user: any) => user.userId === patientId);
  if (!patient) return;
  
  const caretakers = patient.connectedCaretakers || [];
  
  // Notify each caretaker
  caretakers.forEach((caretakerId: string) => {
    addNotification(caretakerId, notification);
  });
};

// Add a history entry
export const addHistoryEntry = (entry: any) => {
  const history = JSON.parse(localStorage.getItem("medicationHistory") || "[]");
  history.push(entry);
  localStorage.setItem("medicationHistory", JSON.stringify(history));
};

// Check for due medications and create notifications
export const checkDueMedications = () => {
  const schedules = JSON.parse(localStorage.getItem("medicationSchedules") || "[]");
  const medications = JSON.parse(localStorage.getItem("medications") || "[]");
  const now = new Date();
  
  // Find schedules that are due in the next 5 minutes but not yet taken
  const dueSchedules = schedules.filter((schedule: MedicationSchedule) => {
    const scheduledTime = new Date(schedule.scheduledTime);
    const timeDiff = (scheduledTime.getTime() - now.getTime()) / (1000 * 60); // Difference in minutes
    
    return !schedule.taken && !schedule.skipped && timeDiff >= 0 && timeDiff <= 5;
  });
  
  // Create notifications for each due schedule
  dueSchedules.forEach((schedule: MedicationSchedule) => {
    const medication = medications.find((med: Medication) => med.id === schedule.medicationId);
    if (!medication) return;
    
    // Notify patient
    addNotification(schedule.patientId, {
      title: "Medication Due Soon",
      message: `${medication.name} (${medication.dosage}) is due at ${format(parseISO(schedule.scheduledTime), "h:mm a")}.`,
      timestamp: new Date().toISOString(),
      type: "medication-due",
      read: false
    });
    
    // Notify caretakers
    notifyCaretakers(schedule.patientId, {
      title: `Medication Due Soon for Patient`,
      message: `${medication.name} (${medication.dosage}) is due at ${format(parseISO(schedule.scheduledTime), "h:mm a")} for your patient.`,
      timestamp: new Date().toISOString(),
      type: "medication-due",
      read: false
    });
  });
  
  return dueSchedules;
};

// Check for missed medications and create notifications
export const checkMissedMedications = () => {
  const schedules = JSON.parse(localStorage.getItem("medicationSchedules") || "[]");
  const medications = JSON.parse(localStorage.getItem("medications") || "[]");
  const now = new Date();
  
  // Find schedules that were due in the last 2 hours but not taken
  const missedSchedules = schedules.filter((schedule: MedicationSchedule) => {
    const scheduledTime = new Date(schedule.scheduledTime);
    const timeDiff = (now.getTime() - scheduledTime.getTime()) / (1000 * 60); // Difference in minutes
    
    return !schedule.taken && !schedule.skipped && timeDiff > 0 && timeDiff <= 120;
  });
  
  // Create notifications for each missed schedule
  missedSchedules.forEach((schedule: MedicationSchedule) => {
    const medication = medications.find((med: Medication) => med.id === schedule.medicationId);
    if (!medication) return;
    
    // Notify patient
    addNotification(schedule.patientId, {
      title: "Missed Medication",
      message: `You missed your ${medication.name} (${medication.dosage}) at ${format(parseISO(schedule.scheduledTime), "h:mm a")}.`,
      timestamp: new Date().toISOString(),
      type: "medication-missed",
      read: false
    });
    
    // Notify caretakers
    notifyCaretakers(schedule.patientId, {
      title: "Patient Missed Medication",
      message: `Your patient missed ${medication.name} (${medication.dosage}) at ${format(parseISO(schedule.scheduledTime), "h:mm a")}.`,
      timestamp: new Date().toISOString(),
      type: "medication-missed",
      read: false
    });
    
    // Mark as skipped after notifying
    schedule.skipped = true;
  });
  
  if (missedSchedules.length > 0) {
    localStorage.setItem("medicationSchedules", JSON.stringify(schedules));
  }
  
  return missedSchedules;
};
