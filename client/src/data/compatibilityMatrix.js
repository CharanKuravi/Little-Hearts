export const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

// COMPATIBILITY[donorType][recipientType] = true/false
export const COMPATIBILITY_MATRIX = {
  'O-':  { 'O-':true,  'O+':true,  'A-':true,  'A+':true,  'B-':true,  'B+':true,  'AB-':true, 'AB+':true  },
  'O+':  { 'O-':false, 'O+':true,  'A-':false, 'A+':true,  'B-':false, 'B+':true,  'AB-':false,'AB+':true  },
  'A-':  { 'O-':false, 'O+':false, 'A-':true,  'A+':true,  'B-':false, 'B+':false, 'AB-':true, 'AB+':true  },
  'A+':  { 'O-':false, 'O+':false, 'A-':false, 'A+':true,  'B-':false, 'B+':false, 'AB-':false,'AB+':true  },
  'B-':  { 'O-':false, 'O+':false, 'A-':false, 'A+':false, 'B-':true,  'B+':true,  'AB-':true, 'AB+':true  },
  'B+':  { 'O-':false, 'O+':false, 'A-':false, 'A+':false, 'B-':false, 'B+':true,  'AB-':false,'AB+':true  },
  'AB-': { 'O-':false, 'O+':false, 'A-':false, 'A+':false, 'B-':false, 'B+':false, 'AB-':true, 'AB+':true  },
  'AB+': { 'O-':false, 'O+':false, 'A-':false, 'A+':false, 'B-':false, 'B+':false, 'AB-':false,'AB+':true  },
};

export function getCompatibleRecipients(donorType) {
  return BLOOD_TYPES.filter(r => COMPATIBILITY_MATRIX[donorType]?.[r]);
}

export function getCompatibleDonors(recipientType) {
  return BLOOD_TYPES.filter(d => COMPATIBILITY_MATRIX[d]?.[recipientType]);
}
