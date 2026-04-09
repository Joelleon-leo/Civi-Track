import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { AuthContext } from '../src/context/AuthContext';
import { Link, useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace('/');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6 py-20">
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">📋</Text>
          </View>
          <Text className="text-4xl font-bold text-center text-blue-800 mb-2">CiviTrack</Text>
          <Text className="text-lg text-center text-gray-500 mb-8">Sign in to report campus issues</Text>
        </View>
        
        <View className="space-y-4 mb-6">
          <TextInput
            className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-800"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-800"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          className="bg-blue-600 py-4 rounded-xl items-center shadow-sm"
          onPress={handleLogin}
        >
          <Text className="text-white font-semibold text-lg">Log in</Text>
        </TouchableOpacity>
        
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Don't have an account? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-semibold">Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
