import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID
      || (import.meta.env.PROD ? '66fc1c80-e950-4d49-8da7-97179199ff84' : ''),
    authority: `https://login.microsoftonline.com/${
      import.meta.env.VITE_MICROSOFT_TENANT_ID
      || (import.meta.env.PROD ? '38fd5a4b-955f-455a-9ad2-d2daa5a4e4d0' : 'common')
    }`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const msalReady = msalInstance.initialize();

export const loginRequest = {
  scopes: ['User.Read'],
};
