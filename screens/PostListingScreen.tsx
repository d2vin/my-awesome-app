import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';

type Props = {
  onAddItem: (item: any) => void;
  currentUserId: string;
};

export default function PostListingScreen({ onAddItem, currentUserId }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access media library is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submitListing = () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title.');
      return;
    }
    const newItem = {
      id: uuidv4(),
      title,
      description,
      imageUri: imageUri || undefined,
      userId: currentUserId,
    };
    onAddItem(newItem);
    setTitle('');
    setDescription('');
    setImageUri(null);
    Alert.alert('Success', 'Listing posted!');
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>Post a Listing</Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 8, marginBottom: 12, borderRadius: 6 }}
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{
          borderWidth: 1,
          padding: 8,
          marginBottom: 12,
          borderRadius: 6,
          height: 80,
          textAlignVertical: 'top',
        }}
      />

      <Button title="Pick an Image" onPress={pickImage} />

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: 200, marginTop: 12, borderRadius: 8 }}
          resizeMode="cover"
        />
      )}

      <View style={{ marginTop: 16 }}>
        <Button title="Submit Listing" onPress={submitListing} />
      </View>
    </View>
  );
}
