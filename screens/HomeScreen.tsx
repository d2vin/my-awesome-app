import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';

type Listing = {
  id: string;
  title: string;
  description: string;
  imageUri?: string;
  userId: string;
};

type Props = {
  items: Listing[];
};

export default function HomeScreen({ items }: Props) {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Available Listings</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16, borderWidth: 1, borderRadius: 8, padding: 12 }}>
            {item.imageUri && (
              <Image
                source={{ uri: item.imageUri }}
                style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 8 }}
                resizeMode="cover"
              />
            )}
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.title}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No items available yet.</Text>}
      />
    </View>
  );
}
