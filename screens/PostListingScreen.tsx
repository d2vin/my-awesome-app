import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

import { supabase } from '../lib/supabase';

type Props = {
  onAddItem: (item: any) => void;
  currentUserId: string;
};

export default function PostListingScreen({ onAddItem, currentUserId }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const uuidv4 = async () => {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return [...randomBytes].map(b => b.toString(16).padStart(2, '0')).join('');
  };


  const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
    try {
      setUploading(true);

      const response = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileExt = uri.split('.').pop();
      const fileName = `${await uuidv4()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      // const { error } = await supabase.storage
      //   .from('images') // replace with your actual bucket name
      //   .upload(filePath, Buffer.from(response, 'base64'), {
      //     contentType: `image/${fileExt}`,
      //     upsert: true,
      //   });

      const { error } = await supabase.storage
        .from('images')
        .upload(filePath, response, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('Upload failed', 'Failed to upload image.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const submitListing = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title.');
      return;
    }

    let uploadedImageUrl: string | undefined = undefined;
    console.log('Image URI:', imageUri);
    if (imageUri) {
      console.log('Uploading image:', imageUri);
      const uploaded = await uploadImageToSupabase(imageUri);
      uploadedImageUrl = uploaded === null ? undefined : uploaded;
      if (!uploadedImageUrl) return; // prevent submission on upload failure
    }

    const newItem = {
      id: await uuidv4(),
      title,
      description,
      imageUrl: uploadedImageUrl,
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
        <Button
          title={uploading ? 'Uploading...' : 'Submit Listing'}
          onPress={submitListing}
          disabled={uploading}
        />
      </View>
    </View>
  );
}
