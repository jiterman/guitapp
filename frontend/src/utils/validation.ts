export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return 'El email es requerido.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Por favor, introduce un correo electrónico válido.';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password || password.trim() === '') {
    return 'La contraseña es requerida.';
  }
  return null;
};

export const validateFirstName = (name: string): string | null => {
  if (!name || name.trim() === '') {
    return 'Este campo es obligatorio.';
  }
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/;
  if (!nameRegex.test(name)) {
    return 'El nombre no debe contener espacios ni números.';
  }
  return null;
};
