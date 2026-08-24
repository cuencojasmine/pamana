export const PAMANA_APP_NAME = 'PAMANA'

export const PAMANA_FULL_NAME =
  'Pampanga AI-powered Mobility Access and Navigation Assistant'

export const PILOT_CORRIDOR =
  'San Luis ↔ City of San Fernando'

export const PAMANA_ROLES = {
  PASSENGER: 'Passenger',
  DRIVER: 'Driver',
  LGU: 'LGU',
  ADMINISTRATOR: 'Administrator'
} as const

export const ROLE_HOME_ROUTES = {
  Passenger: '/passenger',
  Driver: '/driver',
  LGU: '/lgu',
  Administrator: '/admin'
} as const