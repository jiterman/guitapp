import { validateEmail, validatePassword, validateFirstName } from '../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should return null for a valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });

    it('should return error for empty email', () => {
      expect(validateEmail('')).toBe('El email es requerido.');
      expect(validateEmail('   ')).toBe('El email es requerido.');
    });

    it('should return error for invalid email', () => {
      expect(validateEmail('test@.com')).toBe('Por favor, introduce un correo electrónico válido.');
      expect(validateEmail('test@example')).toBe(
        'Por favor, introduce un correo electrónico válido.'
      );
    });
  });

  describe('validatePassword', () => {
    it('should return null for a valid password', () => {
      expect(validatePassword('123456')).toBeNull();
    });

    it('should return error for empty password', () => {
      expect(validatePassword('')).toBe('La contraseña es requerida.');
      expect(validatePassword('   ')).toBe('La contraseña es requerida.');
    });
  });

  describe('validateFirstName', () => {
    it('should return null for a valid first name', () => {
      expect(validateFirstName('Chris')).toBeNull();
      expect(validateFirstName('María')).toBeNull();
    });

    it('should return error for empty first name', () => {
      expect(validateFirstName('')).toBe('Este campo es obligatorio.');
      expect(validateFirstName('   ')).toBe('Este campo es obligatorio.');
    });

    it('should return error for names with numbers or spaces', () => {
      expect(validateFirstName('Chris 2')).toBe('El nombre no debe contener espacios ni números.');
      expect(validateFirstName('John Doe')).toBe('El nombre no debe contener espacios ni números.');
    });
  });
});
