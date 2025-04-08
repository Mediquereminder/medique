
// Initialize demo data for the application
export const initializeData = () => {
  // Initialize users if they don't exist
  if (!localStorage.getItem("users")) {
    const users = [
      {
        userId: "admin1",
        name: "Dr. Sarah Johnson",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
        department: "General Medicine",
        connectedPatients: ["patient1", "patient2"],
        notifications: [
          {
            title: "New Patient Connected",
            message: "You are now connected with John Doe as their caretaker.",
            timestamp: new Date().toISOString(),
            type: "connection",
            read: false
          }
        ]
      },
      {
        userId: "patient1",
        name: "John Doe",
        email: "patient@example.com",
        password: "patient123",
        role: "patient",
        uniqueCode: "JD1234",
        connectedCaretakers: ["admin1"],
        notifications: [
          {
            title: "Medication Reminder",
            message: "Time to take your Aspirin (100mg).",
            timestamp: new Date().toISOString(),
            type: "reminder",
            read: false
          }
        ]
      },
      {
        userId: "patient2",
        name: "Jane Smith",
        email: "jane@example.com",
        password: "jane123",
        role: "patient",
        uniqueCode: "JS5678",
        connectedCaretakers: ["admin1"],
        notifications: []
      }
    ];
    localStorage.setItem("users", JSON.stringify(users));
  }

  // Initialize medication stock if it doesn't exist
  if (!localStorage.getItem("medicationStock")) {
    const medicationStock = [
      {
        id: "med1",
        patientId: "patient1",
        name: "Aspirin",
        quantity: 30,
        threshold: 10,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "med2",
        patientId: "patient1",
        name: "Paracetamol",
        quantity: 15,
        threshold: 5,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "med3",
        patientId: "patient1",
        name: "Vitamin D",
        quantity: 60,
        threshold: 15,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "med4",
        patientId: "patient2",
        name: "Ibuprofen",
        quantity: 20,
        threshold: 10,
        lastUpdated: new Date().toISOString()
      },
      {
        id: "med5",
        patientId: "patient2",
        name: "Amoxicillin",
        quantity: 5,
        threshold: 3,
        lastUpdated: new Date().toISOString()
      }
    ];
    localStorage.setItem("medicationStock", JSON.stringify(medicationStock));
  }

  // Initialize medication schedule if it doesn't exist
  if (!localStorage.getItem("medicationSchedule")) {
    const medicationSchedule = [
      {
        id: "sched1",
        patientId: "patient1",
        medicationId: "med1",
        medicationName: "Aspirin",
        dosage: "100mg",
        frequency: "daily",
        timeOfDay: ["morning"],
        startDate: new Date().toISOString(),
        endDate: null,
        lastTaken: null
      },
      {
        id: "sched2",
        patientId: "patient1",
        medicationId: "med2",
        medicationName: "Paracetamol",
        dosage: "500mg",
        frequency: "as needed",
        timeOfDay: [],
        startDate: new Date().toISOString(),
        endDate: null,
        lastTaken: null
      }
    ];
    localStorage.setItem("medicationSchedule", JSON.stringify(medicationSchedule));
  }
};
