import { validateEmail, validatePassword } from '../src/utils/validation';

describe('validation utilities', () => {
  describe('validateEmail', () => {
    it('returns an error message if email is empty', () => {
      expect(validateEmail('')).toBe('El email es requerido.');
    });

    it('returns an error message if email format is invalid', () => {
      expect(validateEmail('invalid-email')).toBe(
        'Por favor, introduce un correo electrónico válido.'
      );
      expect(validateEmail('test@')).toBe('Por favor, introduce un correo electrónico válido.');
      expect(validateEmail('@domain.com')).toBe(
        'Por favor, introduce un correo electrónico válido.'
      );
    });

    it('returns null if email format is valid', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name+tag@domain.co.uk')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('returns an error message if password is empty', () => {
      expect(validatePassword('')).toBe('La contraseña es requerida.');
    });

    it('returns null if password is provided', () => {
      // The current LoginScreen only checks if it's not empty.
      // We can add length checks if desired, but for now we'll match existing behavior.
      expect(validatePassword('123')).toBeNull();
      expect(validatePassword('secretpassword')).toBeNull();
    });
  });
});
