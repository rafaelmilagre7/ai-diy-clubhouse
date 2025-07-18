
import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-600">Dashboard carregado com sucesso</h1>
      <p className="mt-4 text-lg">Se você está vendo esta mensagem, o problema estava nos componentes internos do Dashboard.</p>
      <p className="mt-2 text-sm text-gray-600">Teste realizado em {new Date().toLocaleString()}</p>
    </div>
  );
};

export default Dashboard;
