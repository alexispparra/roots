
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Conditionally initialize the Google AI plugin.
// This prevents build failures if the API key is not set in the environment.
const plugins = [];
if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
} else {
  // This log will appear in the build logs on Firebase App Hosting
  console.log("Build Warning: GOOGLE_API_KEY is not set. Genkit AI features will be disabled at runtime.");
}

export const ai = genkit({
  plugins: plugins,
  // Set a default model only if the plugin is active.
  model: plugins.length > 0 ? 'googleai/gemini-2.0-flash' : undefined,
});
