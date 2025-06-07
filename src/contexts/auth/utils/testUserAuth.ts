// This file is maintained for backward compatibility
// It re-exports all test auth functions from the new structure

import { 
  createTestUser, 
  signInAsTestMember, 
  signInAsTestAdmin, 
  TEST_MEMBER, 
  TEST_ADMIN 
} from './testAuth';

// Re-export for backward compatibility
export { 
  createTestUser, 
  signInAsTestMember, 
  signInAsTestAdmin 
};

