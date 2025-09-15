import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, ScrollView, TextInput, Button, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { SvgXml } from 'react-native-svg';

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

// SVG for the logout icon
const logoutIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
  <path fill-rule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
</svg>
`;

export default function ProfileScreen({ items }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        setUser({ id: user.id, email: user.email });
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user;
      if (authUser && authUser.email) {
        setUser({ id: authUser.id, email: authUser.email });
      } else {
        setUser(null);
      }
      if (_event === 'SIGNED_IN') {
        // User signed in event handler (if needed)
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      setErrorMsg('');
      if (data.user && data.user.email) {
        setUser({ id: data.user.id, email: data.user.email });
      } else {
        setUser(null);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmail('');
    setPassword('');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Determine which user's items to show based on signed-in user
  const userItems = user ? items.filter((item) => item.userId === user.id) : [];
  console.log('User items:', userItems);
  console.log('All items:', items);
  console.log('Current user:', user);
  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop: 20, paddingBottom: 20 }}>
      <View style={{ width: '100%', maxWidth: 400, paddingHorizontal: 16 }}>
        {user ? (
          // Signed-in view
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{user.email}</Text>
            <TouchableOpacity onPress={handleSignOut} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <SvgXml xml={logoutIconSvg} width="24" height="24" />
            </TouchableOpacity>
          </View>
        ) : (
          // Sign-in form
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' }}>
              Sign In
            </Text>
            <TextInput
              placeholder="Email"
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 8, padding: 8 }}
            />
            <TextInput
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 8, padding: 8 }}
            />
            <Button title="Sign In" onPress={handleSignIn} />
            {errorMsg ? <Text style={{ color: 'red', marginTop: 8 }}>{errorMsg}</Text> : null}
          </View>
        )}

        {/* --- Only show the "My Listings" section if the user is logged in --- */}
        {user && (
          <>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' }}>
              My Listings
            </Text>

            <FlatList
              data={userItems}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
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
                  {user ? 'You haven\'t posted any listings yet.' : 'Please sign in to view your listings.'}
                </Text>
              }
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}
