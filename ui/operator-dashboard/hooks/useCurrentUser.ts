// Custom hook for getting current user context
// Currently returns hardcoded user for demo/mock mode
// Can be extended to use auth context in production

export function useCurrentUser() {
  // In production, this would pull from auth context/session
  // For now, return the demo user ID
  const userId = "user_demo_001";

  return {
    userId,
    isAuthenticated: true,
  };
}
