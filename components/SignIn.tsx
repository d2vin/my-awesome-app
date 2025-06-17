import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { supabase } from '../lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState<any>(null);

  // Check if user is already signed in on mount
  useEffect(() => {
    const sessionUser = supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    // Optional: listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
      setUser(data.user);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmail('');
    setPassword('');
  };

  if (user) {
    // Show something else when signed in
    return (
      <View>
        <Text>Welcome, {user.email}!</Text>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    );
  }

  // Show sign-in form when not signed in
  return (
    <View>
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
  );
}
