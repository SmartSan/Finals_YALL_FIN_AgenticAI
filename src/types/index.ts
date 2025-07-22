export type HistoryItem = {
  id?: string; // Firestore document ID
  userId: string;
  receiptImageUri: string;
  extractedText: string;
  timestamp: number;
};
