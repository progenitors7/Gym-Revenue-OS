export const SUPER_ADMIN_EMAILS = [
  'scn1155@gmail.com', // Primary Admin
];

export const isSuperAdmin = (email) => {
  return email && SUPER_ADMIN_EMAILS.includes(email);
};
