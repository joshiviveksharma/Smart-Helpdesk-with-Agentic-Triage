import { appConfig } from '../config';

export type Classification = { predictedCategory: 'billing' | 'tech' | 'shipping' | 'other'; confidence: number };

export type DraftResult = { draftReply: string; citations: string[] };

export interface LlmProvider {
  classify(text: string): Promise<Classification>;
  draft(text: string, articles: { id: string; title: string }[]): Promise<DraftResult>;
}

class StubLlmProvider implements LlmProvider {
  async classify(text: string): Promise<Classification> {
    const lower = text.toLowerCase();
    let category: Classification['predictedCategory'] = 'other';
    let score = 0.3;
    const matches = (words: string[]) => words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
    const billingHits = matches(['refund', 'invoice', 'payment', 'charge']);
    const techHits = matches(['error', 'bug', 'stack', 'crash', '500']);
    const shippingHits = matches(['delivery', 'shipment', 'package', 'tracking']);
    if (billingHits >= techHits && billingHits >= shippingHits && billingHits > 0) {
      category = 'billing';
      score = Math.min(1, 0.5 + 0.1 * billingHits);
    } else if (techHits >= billingHits && techHits >= shippingHits && techHits > 0) {
      category = 'tech';
      score = Math.min(1, 0.5 + 0.1 * techHits);
    } else if (shippingHits > 0) {
      category = 'shipping';
      score = Math.min(1, 0.5 + 0.1 * shippingHits);
    }
    return { predictedCategory: category, confidence: score };
  }

  async draft(text: string, articles: { id: string; title: string }[]): Promise<DraftResult> {
    const numbered = articles.map((a, i) => `${i + 1}. ${a.title}`).join('\n');
    const reply = `Thanks for reaching out. Based on your message, here are helpful references:\n${numbered}\n\nPlease review the above and let us know if you need more help.`;
    return { draftReply: reply, citations: articles.map((a) => a.id) };
  }
}

export function getLlmProvider(): LlmProvider {
  // In real mode, instantiate OpenAI-based provider; here we always return stub when STUB_MODE
  if (appConfig.stubMode || !appConfig.openaiApiKey) return new StubLlmProvider();
  return new StubLlmProvider();
}


