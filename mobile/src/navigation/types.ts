import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack Types
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ConfirmSignUp: {
    email: string;
  };
  ForgotPassword: undefined;
  ResetPassword: {
    email: string;
  };
};

// Main Tab Navigator Types
export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Post: undefined;
  Messages: undefined;
  Profile: undefined;
};

// Home Stack Types
export type HomeStackParamList = {
  HomeMain: undefined;
  CategoryDetails: {
    category: {
      id: string;
      name: string;
      icon: string;
      [key: string]: any;
    };
  };
  TaskDetails: {
    task: {
      id: string;
      title: string;
      [key: string]: any;
    };
  };
  ProviderProfile: {
    provider: {
      id: string;
      name: string;
      [key: string]: any;
    };
  };
  PopularTasks: undefined;
  TopTaskers: undefined;
  Filters: undefined;
  TaskCreate: undefined;
};

// Profile Stack Types
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  Privacy: undefined;
  Help: undefined;
  About: undefined;
};

// Root Navigator Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
