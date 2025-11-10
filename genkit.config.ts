import {googleAI} from '@genkit-ai/google-genai';
import {genkit} from 'genkit';

export default genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
