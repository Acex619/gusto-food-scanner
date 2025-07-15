// This file is a re-export of the hooks/use-toast functionality
// We should avoid circular dependencies by removing this file and updating imports

// Provide a more useful error message to help developers update their imports
throw new Error(`
  The file 'components/ui/use-toast.ts' is deprecated and creates circular dependencies.
  Please import directly from '@/hooks/use-toast' instead.
`);
