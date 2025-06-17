// import { ScreenContent } from 'components/ScreenContent';
// import { StatusBar } from 'expo-status-bar';
import 'react-native-url-polyfill/auto';
import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './navigation/TabNavigator';

import './global.css';

export type Listing = {
  id: string;
  title: string;
  description: string;
  imageUri?: string;
  userId: string;
};

// export default function App() {
//   return (
//     <>
//       <ScreenContent title="Home" path="App.tsx"></ScreenContent>
//       <StatusBar style="auto" />
//     </>
//   );
// }

export default function App() {
  const [items, setItems] = useState<Listing[]>([]);
  const currentUserId = 'user-123'; // Dummy current user

  const addItem = (item: Listing) => {
    setItems((prev) => [item, ...prev]);
  };

  return (
    <NavigationContainer>
      <TabNavigator items={items} addItem={addItem} currentUserId={currentUserId} />
    </NavigationContainer>
  );
}