const auth = {
  signIn: 'Sign in',
  signingIn: 'Signing in…',
  noAccount: 'No account?',
  createOne: 'Create one',
  fields: {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
  },
  validation: {
    required: 'Required.',
    emailRequired: 'Email is required.',
    emailInvalid: 'Enter a valid email address.',
    passwordRequired: 'Password is required.',
    passwordRequirements: 'Password does not meet all requirements.',
    confirmPasswordRequired: 'Please confirm your password.',
    passwordsMismatch: 'Passwords do not match.',
  },
  errors: {
    accountLocked: 'Account locked. Try again later.',
    tooManyAttempts: 'Too many attempts. Please wait a minute and try again.',
    invalidCredentials: 'Invalid email or password.',
    emailExists: 'An account with this email already exists.',
  },
  login: {
    continueWithGoogle: 'Continue with Google',
    continueWithEmail: 'Continue with email',
    hint: 'Sign in to your account',
    pills: {
      jointBudgets: 'Joint budgets',
      bankSync: 'Bank sync',
      liveStats: 'Live stats',
    },
    legal: 'By continuing you agree to our <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>.',
    googleFailed: 'Google sign-in failed. Please try again.',
  },
  emailLogin: {
    title: 'Welcome back',
    subtitle: 'Sign in with your Tavira account',
    forgotPassword: 'Forgot password?',
  },
  register: {
    title: 'Create account',
    subtitle: 'Start tracking your spending with Tavira',
    submit: 'Create account',
    creating: 'Creating account…',
    haveAccount: 'Already have an account?',
    passwordChecks: {
      length: '8+ characters',
      uppercase: 'Uppercase letter',
      digit: 'One digit',
      special: 'Special character',
    },
  },
};

export default auth;
