
// Este arquivo não é mais necessário, pois as rotas admin agora estão
// diretamente no AppRoutes.tsx com o AdminLayout apropriado.
// Mantendo este arquivo vazio para evitar erros de importação em outros lugares.

import { FC } from 'react';

const AdminRoutes: FC = () => {
  console.log("Aviso: AdminRoutes está obsoleto, use AppRoutes para rotas administrativas");
  return null;
};

export default AdminRoutes;
