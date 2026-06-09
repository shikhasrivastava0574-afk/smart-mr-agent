/* js/schedulingAgent.js */

import { MEETINGS_DATA, MR_DATA, DOCTORS_DATA } from './data.js';

export class SchedulingAgent {
  constructor() {
    this.name = "Scheduling Agent";
    this.colorClass = "sender-scheduling";
  }

  /**
   * Simulates the agent's thinking logs for terminal
   */
  getThinkingLogs(mrName, doctorName, date, time) {
    return [
      `Initiating scheduling protocol for Rep: "${mrName}" & Client: "${doctorName}".`,
      `Validating target date [${date}] and request time slot [${time}]...`,
      `Retrieving doctor's weekly clinic availability calendar...`,
      `Checking representative's active routes and potential scheduling conflicts...`,
      `Evaluating transit time between existing appointments to optimize gas/CO2 footprints.`,
      `Running auto-scheduler optimization matrix...`
    ];
  }

  /**
   * Schedules a meeting automatically
   * @returns {Object} { success: boolean, meeting: Object, errorLogs: Array<string>, warningLogs: Array<string> }
   */
  scheduleMeeting(mrId, doctorId, date, time, notes = "") {
    const errorLogs = [];
    const warningLogs = [];
    
    const mr = MR_DATA.find(m => m.id === mrId);
    const doctor = DOCTORS_DATA.find(d => d.id === doctorId);

    if (!mr) {
      errorLogs.push(`Scheduling Error: Representative ID [${mrId}] not found in database.`);
      return { success: false, errorLogs };
    }
    if (!doctor) {
      errorLogs.push(`Scheduling Error: Doctor ID [${doctorId}] not found in database.`);
      return { success: false, errorLogs };
    }

    // Check doctor availability based on weekday
    const meetingDate = new Date(date);
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const meetingDayName = weekdays[meetingDate.getDay()];

    const isDoctorAvailable = doctor.availability.some(
      day => day.toLowerCase() === meetingDayName.toLowerCase()
    );

    if (!isDoctorAvailable) {
      warningLogs.push(`Scheduling Notice: ${doctor.name} is typically not available on ${meetingDayName}s. (Availability: ${doctor.availability.join(', ')}).`);
    }

    // Check doctor region vs MR territory
    if (mr.territory.toLowerCase() !== doctor.region.toLowerCase()) {
      warningLogs.push(`Routing Alert: Doctor clinic is in ${doctor.region}, but representative is assigned to ${mr.territory}. Commute overhead detected.`);
    }

    // Check scheduling conflicts (same MR, same date & close time)
    const timeThresholdMins = 60; // minimum gap of 60 mins
    const newDateTime = new Date(`${date}T${time}:00`);

    const hasConflict = MEETINGS_DATA.some(meet => {
      if (meet.mrId === mrId && meet.date === date && meet.status !== "cancelled") {
        const existingDateTime = new Date(`${meet.date}T${meet.time}:00`);
        const diffMs = Math.abs(newDateTime - existingDateTime);
        const diffMins = diffMs / 1000 / 60;
        return diffMins < timeThresholdMins;
      }
      return false;
    });

    if (hasConflict) {
      errorLogs.push(`Conflict Detected: Rep ${mr.name} has another appointment on ${date} within ${timeThresholdMins} minutes of ${time}.`);
      return { success: false, errorLogs, warningLogs };
    }

    return {
      success: true,
      errorLogs,
      warningLogs
    };
  }
}
