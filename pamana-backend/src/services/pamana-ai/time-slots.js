'use strict';

/**
 * Phase 13.2 - Normalize Time
 * One hour buckets, matching how passenger-demand-observation.time_slot is seeded.
 */

const pad = (n) => String(n).padStart(2, '0');

const timeSlotForHour = (hour) => `${pad(hour)}:00-${pad((hour + 1) % 24)}:00`;

const timeSlotForDate = (date) => timeSlotForHour(date.getHours());

module.exports = { timeSlotForHour, timeSlotForDate };
