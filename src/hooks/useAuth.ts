// Minimal useAuth hook for compatibility during transition
export function useAuth() {
  // Temporarily return a mock user for development
  const mockUser = {
    id: 'temp-user',
    email: 'temp@weblaunchcoach.com',
    userType: 'student' as const,
    studentProfile: {
      full_name: 'Development User',
      email: 'temp@weblaunchcoach.com'
    }
  }

  return {
    user: mockUser,
    loading: false,
    signUp: async () => ({ user: null, session: null }),
    signIn: async () => ({ user: null, session: null }),
    signOut: async () => {},
    updateStudentProfile: async () => ({}),
    isAdmin: false,
    isStudent: true,
  }
}