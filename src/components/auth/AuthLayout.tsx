
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './login/LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthLayoutProps {
  initialTab?: string;
}

const AuthLayout = ({ initialTab = 'login' }: AuthLayoutProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Cadastro</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="signup">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthLayout;
