import { 
  AuthStackParamList, 
  HomeStackParamList,
  MainTabParamList,
  ProfileStackParamList,
  RootStackParamList 
} from './src/navigation/types';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
