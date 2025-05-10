
// Importe a nova página de atualização de durações
import AtualizarDuracoesPage from "./pages/admin/aulas/AtualizarDuracoesPage";

// No objeto de rotas, adicione as seguintes rotas:
// (Não estou escrevendo o arquivo inteiro, apenas ilustrando onde adicionar as novas rotas)

// Dentro das rotas de administração, adicione:
{
  path: "duracao-videos",
  element: <AtualizarDuracoesPage />,
},
{
  path: "duracao-videos/curso/:cursoId",
  element: <AtualizarDuracoesPage />,
},
{
  path: "duracao-videos/aula/:aulaId",
  element: <AtualizarDuracoesPage />,
},
