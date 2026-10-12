import { TaxIdFormatPipe } from './tax-id-format.pipe';

describe('TaxIdFormatPipe', () => {
  const pipe = new TaxIdFormatPipe();

  it('should transform empty or null input to empty string', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should format 9 digits into XX-XXXXXXX', () => {
    expect(pipe.transform('123456789')).toBe('12-3456789');
  });

  it('should format already hyphenated string consistently', () => {
    expect(pipe.transform('12-3456789')).toBe('12-3456789');
  });

  it('should return short digits without hyphen', () => {
    expect(pipe.transform('12')).toBe('12');
  });
});
