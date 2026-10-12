import { MaskSensitivePipe } from './mask-sensitive.pipe';

describe('MaskSensitivePipe', () => {
  const pipe = new MaskSensitivePipe();

  it('should mask Tax ID by default', () => {
    const masked = pipe.transform('12-3456789', 'taxId', false);
    expect(masked).toBe('**-***6789');
  });

  it('should reveal Tax ID when revealed is true', () => {
    const revealed = pipe.transform('12-3456789', 'taxId', true);
    expect(revealed).toBe('12-3456789');
  });

  it('should mask Bank Account Number by default', () => {
    const masked = pipe.transform('98765432101234', 'bankAccount', false);
    expect(masked).toBe('•••• •••• •••• 1234');
  });

  it('should reveal Bank Account Number when revealed is true', () => {
    const revealed = pipe.transform('98765432101234', 'bankAccount', true);
    expect(revealed).toBe('98765432101234');
  });

  it('should return empty string for null or empty values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});
