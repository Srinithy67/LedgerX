import { IOcrService, ExtractedTransaction } from '../../adapters/services/OcrService';
import { ICategoryRepository } from './repositories/ICategoryRepository';

export interface OcrSuggestion {
  merchantName: string;
  amount: number;
  date: Date;
  categoryName: string;
  categoryId: string | null;
  confidence: number;
  isDebit: boolean;
  shouldSuggest: boolean;
}

export class OcrUseCase {
  constructor(
    private ocrService: IOcrService,
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(userId: string, fileBuffer: Buffer): Promise<OcrSuggestion> {
    const extracted: ExtractedTransaction = await this.ocrService.processReceipt(fileBuffer);

    // Look up category in the database to see if we have a match
    let categoryId: string | null = null;
    const category = await this.categoryRepo.findByName(userId, extracted.categorySuggestion);
    if (category) {
      categoryId = category.id;
    }

    // Only debit transactions should be suggested as expenses
    const shouldSuggest = extracted.isDebit;

    return {
      merchantName: extracted.merchantName,
      amount: extracted.amount,
      date: extracted.date,
      categoryName: extracted.categorySuggestion,
      categoryId,
      confidence: extracted.confidence,
      isDebit: extracted.isDebit,
      shouldSuggest,
    };
  }
}
