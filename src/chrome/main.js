import { initialize } from './background';

// Initialize the application
initialize().catch(error => {
  console.error('Failed to initialize WikiMapper:', error);
});
