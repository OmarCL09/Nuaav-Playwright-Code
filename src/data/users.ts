export const PASSWORD = 'secret_sauce';

export interface TestUser {
  readonly username: string;
  readonly password: string;
  readonly behaviour: string;
}

export const users = {
  standard: {
    username: 'standard_user',
    password: PASSWORD,
    behaviour: 'Fully functional',
  },

  lockedOut: {
    username: 'locked_out_user',
    password: PASSWORD,
    behaviour: 'Login blocked by the app',
  },

  problem: {
    username: 'problem_user',
    password: PASSWORD,
    behaviour: 'Broken images, some interactions fail',
  },

  performanceGlitch: {
    username: 'performance_glitch_user',
    password: PASSWORD,
    behaviour: 'Artificially delayed loads',
  },

  error: {
    username: 'error_user',
    password: PASSWORD,
    behaviour: 'Intermittent checkout form errors',
  },
} as const satisfies Record<string, TestUser>;

export const loginErrors = {
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  missingUsername: 'Epic sadface: Username is required',
  missingPassword: 'Epic sadface: Password is required',
} as const;
