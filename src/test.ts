import { updateUserProfile, getUserProfile } from './integrations/firebase';

const testUserId = 'test-user-123';
const testUserName = 'Test User';
const testUserEmail = 'test@example.com';

const runTest = async () => {
  console.log('Running database test...');
  
  // Update user profile
  await updateUserProfile(testUserId, testUserName, testUserEmail);
  
  // Get user profile
  const userProfile = await getUserProfile(testUserId);
  
  // Verify the data
  if (userProfile && userProfile.name === testUserName && userProfile.email === testUserEmail) {
    console.log('Database test successful: User data saved and retrieved correctly.');
  } else {
    console.error('Database test failed: User data does not match.');
  }
};

runTest();
