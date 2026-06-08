import fs from 'fs/promises';

export async function loadSystemPrompt() {
 return await fs.readFile(
  './prompts/systemPrompt.md',
  'utf-8'
);
}