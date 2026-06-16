import { TesseractOcrService } from '../adapters/services/OcrService';

describe('TesseractOcrService Parse Tests', () => {
  let ocrService: TesseractOcrService;

  beforeEach(() => {
    ocrService = new TesseractOcrService();
  });

  test('should parse Ceremony Coffee debit receipt correctly', () => {
    const mockReceiptText = `
      Ceremony Coffee
      10/24/2023 08:45 AM
      Morning Matcha Ritual
      TOTAL: $12.50
    `;

    const result = ocrService.parseReceiptText(mockReceiptText);

    expect(result.merchantName).toBe('Ceremony Coffee');
    expect(result.amount).toBe(12.50);
    expect(result.date.getFullYear()).toBe(2023);
    expect(result.date.getMonth()).toBe(9); // October is index 9
    expect(result.date.getDate()).toBe(24);
    expect(result.categorySuggestion).toBe('Dining Out');
    expect(result.isDebit).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(80);
  });

  test('should parse Bloom Media debit receipt correctly', () => {
    const mockReceiptText = `
      BLOOM MEDIA
      2023-10-23 14:15
      Journal Supplies & Tape
      Total: $45.00
    `;

    const result = ocrService.parseReceiptText(mockReceiptText);

    expect(result.merchantName).toBe('BLOOM MEDIA');
    expect(result.amount).toBe(45.00);
    expect(result.date.getFullYear()).toBe(2023);
    expect(result.date.getMonth()).toBe(9); // October is index 9
    expect(result.date.getDate()).toBe(23);
    expect(result.categorySuggestion).toBe('Creativity');
    expect(result.isDebit).toBe(true);
  });

  test('should detect refund/credit transaction and flag isDebit as false', () => {
    const mockReceiptText = `
      Whole Foods Market
      10/22/2023
      Item Returns
      Refunded Amount: $25.00
    `;

    const result = ocrService.parseReceiptText(mockReceiptText);

    expect(result.merchantName).toBe('Whole Foods Market');
    expect(result.amount).toBe(25.00);
    expect(result.categorySuggestion).toBe('Groceries');
    expect(result.isDebit).toBe(false);
  });
});
