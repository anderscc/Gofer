export const AUTH_CONFIG = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || process.env.EXPO_PUBLIC_AWS_REGION,
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
  userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
  identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || process.env.EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID,
  googleWebClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  googleIosClientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  oauth: {
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || process.env.EXPO_PUBLIC_COGNITO_DOMAIN,
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: process.env.NEXT_PUBLIC_SIGN_IN_REDIRECT_URL || process.env.EXPO_PUBLIC_SIGN_IN_REDIRECT_URL,
    redirectSignOut: process.env.NEXT_PUBLIC_SIGN_OUT_REDIRECT_URL || process.env.EXPO_PUBLIC_SIGN_OUT_REDIRECT_URL,
    responseType: 'code',
  },
};
