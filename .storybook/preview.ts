import type { Preview } from '@storybook/nextjs-vite';
import '../src/styles/globals.css';

const preview: Preview = {
  beforeEach() {
    document.documentElement.lang = 'nl';
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
    a11y: { test: 'error' },
  },
};
export default preview;
