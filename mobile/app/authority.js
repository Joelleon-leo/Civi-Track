import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../src/api/axios';

export default function AuthorityScreen() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // For updating
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !newStatus) return;
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/status`, { status: newStatus, note });
      Alert.alert('Success', 'Status updated');
      setSelectedComplaint(null);
      setNewStatus('');
      setNote('');
      fetchComplaints();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) return <ActivityIndicator size="large" className="flex-1" />;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6 bg-white border-b border-gray-200">
        <TouchableOpacity className="mb-4" onPress={() => router.back()}>
            <Text className="text-blue-600 font-semibold text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Authority Dashboard</Text>
        <Text className="text-gray-500">Manage Campus Issues</Text>
      </View>

      {selectedComplaint ? (
        <View className="p-6 bg-white m-4 rounded-2xl border border-gray-200 shadow-sm">
            <Text className="text-lg font-bold mb-4">Update: {selectedComplaint.title}</Text>
            
            <Text className="text-sm font-semibold text-gray-700 mb-2">New Status</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
               {['Assigned', 'In Progress', 'Resolved', 'Closed'].map(st => (
                 <TouchableOpacity 
                   key={st}
                   className={`px-4 py-2 rounded-full border ${newStatus === st ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                   onPress={() => setNewStatus(st)}
                 >
                   <Text className={newStatus === st ? 'text-white font-bold' : 'text-gray-700'}>{st}</Text>
                 </TouchableOpacity>
               ))}
            </View>

            <Text className="text-sm font-semibold text-gray-700 mb-2">Note</Text>
            <TextInput
              className="bg-slate-50 px-4 py-3 rounded-xl border border-gray-200 mb-4 h-24"
              placeholder="Add update note (optional)"
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center mr-2"
                onPress={() => setSelectedComplaint(null)}
              >
                <Text className="text-gray-700 font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-blue-600 py-3 rounded-xl items-center ml-2"
                onPress={handleUpdateStatus}
              >
                <Text className="text-white font-bold">Save</Text>
              </TouchableOpacity>
            </View>
        </View>
      ) : (
        <FlatList
          className="flex-1 px-4 py-2"
          data={complaints}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-white p-5 rounded-2xl mb-4 border border-gray-100 shadow-sm flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-bold text-gray-900 mb-1">{item.title}</Text>
                <Text className="text-sm text-gray-500 mb-2">{item.department} • {item.status}</Text>
              </View>
              <TouchableOpacity 
                className="bg-purple-100 px-4 py-2 rounded-lg"
                onPress={() => setSelectedComplaint(item)}
              >
                <Text className="text-purple-700 font-bold">Update</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
