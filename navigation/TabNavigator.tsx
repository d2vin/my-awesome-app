import React, { useEffect, useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import PostListingScreen from '../screens/PostListingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { supabase } from '../lib/supabase';

const Tab = createBottomTabNavigator();

type Listing = {
  id: string;
  title: string;
  description: string;
  imageUri?: string;
  userId: string;
};

type TabNavigatorProps = {
  addItem: (item: Listing) => void;
  currentUserId: string;
  items: Listing[];
};

export default function TabNavigator({ addItem, currentUserId }: TabNavigatorProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchImageListings = useCallback(async () => {
    setRefreshing(true);

    const { data, error } = await supabase.storage.from('images').list('', {
      limit: 100,
    });

    if (error) {
      console.error('Error fetching image list:', error.message);
      setRefreshing(false);
      return;
    }

    const imageFiles = (data || []).filter(
      (file) =>
        file.name !== '.emptyFolderPlaceholder' &&
        file.metadata?.mimetype?.startsWith('image/')
    );

    const listings = imageFiles.map((file, index) => {
      const { data: publicData } = supabase.storage
        .from('images')
        .getPublicUrl(file.name);

      return {
        id: `example-${index}`,
        title: `Sample Item #${index + 1}`,
        description: `This is a demo listing using the image "${file.name}".`,
        imageUri: publicData?.publicUrl,
        userId: `user_${index + 1}`,
      };
    });

    setListings(listings);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchImageListings();
  }, [fetchImageListings]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Post Listing') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home">
        {() => (
          <HomeScreen
            items={listings}
            onRefresh={fetchImageListings}
            refreshing={refreshing}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Post Listing">
        {() => <PostListingScreen onAddItem={addItem} currentUserId={currentUserId} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => <ProfileScreen items={listings} currentUserId={currentUserId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
