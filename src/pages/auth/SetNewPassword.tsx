
import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import { SetNewPasswordForm } from '@/components/auth/SetNewPasswordForm';

const SetNewPassword = () => {
  return (
    <AuthLayout>
      <SetNewPasswordForm />
    </AuthLayout>
  );
};

export default SetNewPassword;
