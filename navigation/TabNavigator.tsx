import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PostListingScreen from '../screens/PostListingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

type TabNavigatorProps = {
  items: any[]; // Replace 'any' with the actual item type if known
  addItem: (item: any) => void; // Replace 'any' with the actual item type if known
  currentUserId: string;
};

export default function TabNavigator({ items, addItem, currentUserId }: TabNavigatorProps) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home">
        {() => <HomeScreen items={items} />}
      </Tab.Screen>
      <Tab.Screen name="Post Listing">
        {() => <PostListingScreen onAddItem={addItem} currentUserId={currentUserId} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => <ProfileScreen items={items} currentUserId={currentUserId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
