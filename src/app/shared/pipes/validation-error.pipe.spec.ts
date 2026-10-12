import { ValidationErrorPipe } from './validation-error.pipe';

describe('ValidationErrorPipe', () => {
  const pipe = new ValidationErrorPipe();

  it('should return empty string if no errors', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should handle required error', () => {
    expect(pipe.transform({ required: true }, 'Business name')).toBe('Business name is required.');
    expect(pipe.transform({ requiredTrue: true }, 'Agreement')).toBe('Agreement is required.');
  });

  it('should handle minlength and maxlength errors', () => {
    expect(pipe.transform({ minlength: { requiredLength: 3, actualLength: 1 } }, 'Name')).toBe(
      'Name must be at least 3 characters.'
    );
    expect(pipe.transform({ maxlength: { requiredLength: 10, actualLength: 12 } }, 'Code')).toBe(
      'Code must not exceed 10 characters.'
    );
  });

  it('should handle email error', () => {
    expect(pipe.transform({ email: true }, 'Email')).toBe('A valid email address is required.');
  });

  it('should handle min error', () => {
    expect(pipe.transform({ min: { min: 500, actual: 100 } }, 'Monthly volume')).toBe(
      'Minimum value is 500.'
    );
  });

  it('should handle pattern error', () => {
    expect(pipe.transform({ pattern: true }, 'Tax ID')).toBe('Invalid tax id format.');
  });
});
