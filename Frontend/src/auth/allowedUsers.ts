// Adicionar mais usuários: incluir o Object ID (oid) do Azure AD
export const ALLOWED_USER_OIDS: string[] = [
  "b7a688cf-e36a-4eb1-97da-36efed5dd2fe", // Alexandre Alves
  "4bd71798-cd86-4238-a1ef-b29572feda64", // Leonardo Martins
];

// Administradores: acesso a todas as páginas e a todas as propostas
export const ADMIN_USER_OIDS: string[] = [
  "4bd71798-cd86-4238-a1ef-b29572feda64", // Leonardo Martins
];
