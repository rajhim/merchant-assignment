import { PhoneFormatPipe } from './phone-format.pipe';

describe('PhoneFormatPipe', () => {
  const pipe = new PhoneFormatPipe();

  it('should return empty string for null or empty input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should format 10 digits as (XXX) XXX-XXXX', () => {
    expect(pipe.transform('5551234567')).toBe('(555) 123-4567');
  });

  it('should format phone number with country code +1', () => {
    expect(pipe.transform('+1-555-123-4567')).toBe('(555) 123-4567');
    expect(pipe.transform('15551234567')).toBe('(555) 123-4567');
  });

  it('should format partial phone numbers', () => {
    expect(pipe.transform('555')).toBe('(555)');
    expect(pipe.transform('555123')).toBe('(555) 123');
  });

  it('should preserve already formatted (XXX) XXX-XXXX numbers', () => {
    expect(pipe.transform('(555) 123-4567')).toBe('(555) 123-4567');
  });
});
