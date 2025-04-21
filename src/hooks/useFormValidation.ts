
import { useState, useEffect } from 'react';

type ValidationRules = {
  [key: string]: {
    validate: (value: any) => boolean;
    message: string;
  }[];
};

export const useFormValidation = (initialValues: any, validationRules: ValidationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const validateField = (name: string, value: any) => {
    const fieldRules = validationRules[name];
    if (!fieldRules) return '';

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
    return '';
  };

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  useEffect(() => {
    const newErrors: {[key: string]: string} = {};
    
    Object.keys(touched).forEach(field => {
      if (touched[field]) {
        const error = validateField(field, values[field]);
        if (error) newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
  }, [values, touched]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    isValid: Object.keys(errors).length === 0
  };
};
