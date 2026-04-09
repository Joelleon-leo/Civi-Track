import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, TextInput, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../src/api/axios';
import { AuthContext } from '../src/context/AuthContext';
import { toMediaUrl } from '../src/api/axios';
import * as ImagePicker from 'expo-image-picker';

export default function AuthorityScreen() {
  const { logout } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // For updating
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [uploadingResolved, setUploadingResolved] = useState(false);
  const [resolvedPreviewUri, setResolvedPreviewUri] = useState(null);

  const buildUploadFile = (uri, prefix) => {
    const match = uri?.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
    const ext = (match?.[1] || 'jpg').toLowerCase();
    const type =
      ext === 'png' ? 'image/png' :
      ext === 'heic' ? 'image/heic' :
      ext === 'webp' ? 'image/webp' :
      'image/jpeg';
    return {
      uri,
      type,
      name: `${prefix}_${Date.now()}.${ext}`,
    };
  };

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

  const refreshSelectedComplaint = async (complaintId) => {
    try {
      const res = await api.get(`/complaints/${complaintId}`);
      setSelectedComplaint(res.data);
    } catch {
      // ignore; list refresh still helps
    }
  };

  const uploadResolvedPicture = async (complaintId, imageUri) => {
    try {
      setUploadingResolved(true);
      const formData = new FormData();

      const uploadMeta = buildUploadFile(imageUri, 'resolved');

      if (Platform.OS === 'web') {
        // On web, axios/FormData expects Blob/File, not React Native's { uri, type, name } shape.
        const resp = await fetch(imageUri);
        const blob = await resp.blob();
        formData.append('resolved_picture', blob, uploadMeta.name);
      } else {
        formData.append('resolved_picture', {
          ...uploadMeta,
        });
      }

      await api.patch(`/complaints/${complaintId}/resolved-picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert('Success', 'Resolved picture uploaded successfully!');
      setNewStatus('Resolved');
      setResolvedPreviewUri(null);
      await refreshSelectedComplaint(complaintId);
      fetchComplaints();
    } catch (e) {
      console.error('Resolved image upload failed', e);
      Alert.alert('Error', e.response?.data?.error || 'Failed to upload resolved picture');
    } finally {
      setUploadingResolved(false);
    }
  };

  const selectResolvedPicture = async () => {
    if (!selectedComplaint?.id) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setResolvedPreviewUri(uri);
        await uploadResolvedPicture(selectedComplaint.id, uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const captureResolvedPicture = async () => {
    if (!selectedComplaint?.id) return;
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to capture a resolved image.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setResolvedPreviewUri(uri);
        await uploadResolvedPicture(selectedComplaint.id, uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image: ' + error.message);
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
    <SafeAreaView className="flex-1 bg-slate-50" style={{ flex: 1, minHeight: Platform.OS === 'web' ? '100vh' : undefined }}>
      <View className="p-6 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-600 font-semibold text-lg">← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-100 px-3 py-2 rounded-lg" onPress={logout}>
            <Text className="text-gray-700 font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
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

            <Text className="text-sm font-semibold text-gray-700 mb-2">Resolved Picture</Text>
            {(resolvedPreviewUri || selectedComplaint.resolved_picture_url) ? (
              <View className="w-full h-44 rounded-xl overflow-hidden bg-white border border-gray-200 mb-3">
                <Image
                  source={{
                    uri: resolvedPreviewUri
                      ? resolvedPreviewUri
                      : toMediaUrl(selectedComplaint.resolved_picture_url)
                  }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View className="w-full rounded-xl bg-slate-50 border border-gray-200 p-4 mb-3">
                <Text className="text-gray-600 text-center">No resolved image uploaded yet.</Text>
              </View>
            )}

            <View className="flex-row mb-4">
              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-xl items-center mr-2"
                onPress={selectResolvedPicture}
                disabled={uploadingResolved}
              >
                {uploadingResolved ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold">Select Image</Text>
                )}
              </TouchableOpacity>
              {Platform.OS !== 'web' && (
                <TouchableOpacity
                  className="flex-1 bg-green-600 py-3 rounded-xl items-center ml-2"
                  onPress={captureResolvedPicture}
                  disabled={uploadingResolved}
                >
                  {uploadingResolved ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold">Capture Image</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center mr-2"
                onPress={() => {
                  setSelectedComplaint(null);
                  setResolvedPreviewUri(null);
                }}
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
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 32 }}
          data={complaints}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-white p-5 rounded-2xl mb-4 border border-gray-100 shadow-sm">
              <View className="flex-row justify-between items-center">
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

              {!!item.primary_image_url && (
                <View className="mt-3">
                  <View className="w-full h-44 rounded-xl overflow-hidden bg-white">
                    <Image
                      source={{ uri: toMediaUrl(item.primary_image_url) }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                </View>
              )}

              <View className="mt-3 flex-row justify-end">
                <TouchableOpacity
                  className="bg-blue-100 px-4 py-2 rounded-lg"
                  onPress={() => router.push(`/complaint/${item.id}`)}
                >
                  <Text className="text-blue-700 font-bold">View Complaint</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
