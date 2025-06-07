import { Task } from '@gofer/ui';
import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Tasks: undefined;
  MyTasks: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  TaskDetails: { task: Task };
  CreateTask: undefined;
  Chat: { taskId: string; otherUserId: string };
  SignIn: undefined;
  SignUp: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
