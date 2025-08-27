import SignIn from 'components/SignIn';
import React from 'react';
import { View, Text, FlatList, Image, ScrollView } from 'react-native';

type Listing = {
  id: string;
  title: string;
  description: string;
  imageUri?: string;
  userId: string;
};

type Props = {
  items: Listing[];
  currentUserId: string;
};

export default function ProfileScreen({ items, currentUserId }: Props) {
  const userItems = items.filter((item) => item.userId === currentUserId);

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 20, paddingBottom: 20 }}>
      <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: 16 }}>
        <SignIn />

        <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' }}>
          My Listings
        </Text>

        <FlatList
          data={userItems}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Disable FlatList's own scrolling
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16, borderWidth: 1, borderRadius: 8, padding: 12 }}>
              {item.imageUri && (
                <Image
                  source={{ uri: item.imageUri }}
                  style={{ width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: 8 }}
                  resizeMode="cover"
                />
              )}
              <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.title}</Text>
              <Text>{item.description}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center' }}>
              You haven&apos;t posted any listings yet.
            </Text>
          }
        />

        {/* TODO: Add messaging UI later */}
        <View style={{ marginTop: 32, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Messages (Coming Soon)</Text>
        </View>
      </View>
    </ScrollView>
  );
}
