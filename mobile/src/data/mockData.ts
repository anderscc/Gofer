// Mock data for Gofer app

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string; // Name of an icon from @expo/vector-icons
  color: string;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  location: string;
  distance: string;
}

export interface TaskProvider {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  completedTasks: number;
  responseRate: number;
  categories: string[];
}

// Service Categories shown on the homepage
export const serviceCategories: ServiceCategory[] = [
  {
    id: '1',
    name: 'Cleaning',
    icon: 'spray',
    color: '#4E7DF1',
  },
  {
    id: '2',
    name: 'Handyman',
    icon: 'tools',
    color: '#FF554A',
  },
  {
    id: '3',
    name: 'Moving',
    icon: 'truck',
    color: '#FFBF00',
  },
  {
    id: '4',
    name: 'Delivery',
    icon: 'package',
    color: '#0CCF83',
  },
  {
    id: '5',
    name: 'Gardening',
    icon: 'leaf',
    color: '#25D366',
  },
  {
    id: '6',
    name: 'Personal',
    icon: 'user',
    color: '#9D5BF0',
  },
  {
    id: '7',
    name: 'Tutoring',
    icon: 'book',
    color: '#FF9F1C',
  },
  {
    id: '8',
    name: 'More',
    icon: 'grid',
    color: '#5F6368',
  },
];

// Popular tasks
export const popularTasks: Task[] = [
  {
    id: '1',
    title: 'House Cleaning',
    category: 'Cleaning',
    price: 60,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    location: 'Nassau',
    distance: '2.3 mi'
  },
  {
    id: '2',
    title: 'Furniture Assembly',
    category: 'Handyman',
    price: 45,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64929?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    location: 'Kingston',
    distance: '1.5 mi'
  },
  {
    id: '3',
    title: 'Lawn Mowing',
    category: 'Gardening',
    price: 35,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1592805144716-feab8c497c31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    location: 'Nassau',
    distance: '3.1 mi'
  },
  {
    id: '4',
    title: 'Grocery Delivery',
    category: 'Delivery',
    price: 25,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    location: 'Kingston',
    distance: '0.8 mi'
  },
];

// Top Taskers/Service Providers
export const topTaskProviders: TaskProvider[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4.9,
    completedTasks: 127,
    responseRate: 98,
    categories: ['Cleaning', 'Delivery']
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.8,
    completedTasks: 95,
    responseRate: 100,
    categories: ['Handyman', 'Moving']
  },
  {
    id: '3',
    name: 'Jessica Williams',
    avatar: 'https://randomuser.me/api/portraits/women/74.jpg',
    rating: 4.7,
    completedTasks: 86,
    responseRate: 94,
    categories: ['Personal', 'Tutoring']
  },
  {
    id: '4',
    name: 'David Thompson',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    rating: 4.9,
    completedTasks: 112,
    responseRate: 97,
    categories: ['Gardening', 'Handyman']
  },
];
