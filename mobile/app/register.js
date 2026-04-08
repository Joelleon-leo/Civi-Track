import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { AuthContext } from '../src/context/AuthContext';
import { Link, useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const { register } = useContext(AuthContext);
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await register(name, email, password, role);
      router.replace('/');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-blue-800 mb-6">Create Account</Text>
        
        <View className="space-y-4 mb-6">
          <TextInput
            className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-gray-800"
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
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
          
          <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {Platform.OS === 'web' ? (
              <select 
                className="w-full p-3 bg-transparent outline-none"
                value={role} 
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="authority">Authority</option>
              </select>
            ) : (
              <TextInput 
                className="bg-white px-4 py-3 text-gray-800"
                placeholder="Role: student | authority"
                value={role}
                onChangeText={(text) => setRole(text.toLowerCase().trim())}
              />
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          className="bg-blue-600 py-4 rounded-xl items-center shadow-sm"
          onPress={handleRegister}
        >
          <Text className="text-white font-semibold text-lg">Sign up</Text>
        </TouchableOpacity>
        
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-semibold">Log in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
