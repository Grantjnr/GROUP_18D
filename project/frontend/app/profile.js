import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { buildApiUrl } from './apiConfig';
export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await SecureStore.getItemAsync('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setIsAvailable(parsed.is_available ?? true);
    }
  };

  const toggleAvailability = async (value) => {
    setIsAvailable(value);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(
        buildApiUrl('/api/auth/toggle-availability/'),
        { is_available: value },
        { headers: { 'Authorization': `Token ${token}` } }
      );
      // Update local storage too
      const userData = await SecureStore.getItemAsync('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        parsed.is_available = value;
        await SecureStore.setItemAsync('userData', JSON.stringify(parsed));
      }
      Alert.alert(
        'Status Updated',
        value ? 'You are now marked as Available' : 'You are now marked as Busy'
      );
    } catch (error) {
      Alert.alert('Error', 'Could not update status. Please try again.');
      setIsAvailable(!value); // revert on failure
    }
  };
 difijidfi
  const handleChangePassword = async () => {
    if (!oldPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(buildApiUrl('/api/auth/change-password/'), {
        old_password: oldPassword,
        new_password: newPassword
      }, {
        headers: { 'Authorization': `Token ${token}` }
      });
     difijidfi
      Alert.alert('Success', 'Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to update password';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
 difijidfi
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user.username[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>Dr. {user.username}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      </View>
      variable 
      {/* Duty Status (Specialists only) */}
      {user.role === 'SPECIALIST' && (
        <View style={[styles.section, { backgroundColor: isAvailable ? '#f0fff4' : '#fff5f5', borderColor: isAvailable ? '#9ae6b4' : '#feb2b2' }]}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.sectionTitle}>Duty Status</Text>
              <Text style={[styles.statusSubtext, { color: isAvailable ? '#38a169' : '#e53e3e' }]}>
                {isAvailable ? '🟢 You are listed as AVAILABLE' : '🔴 You are currently BUSY'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: '#feb2b2', true: '#9ae6b4' }}
              thumbColor={isAvailable ? '#38a169' : '#e53e3e'}
            />
          </View>
        </View>
      )}
    
      {/* Account Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#718096" />
          <Text style={styles.infoText}>{user.username}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#718096" />
          <Text style={styles.infoText}>{user.email || 'No email set'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="finger-print-outline" size={20} color="#718096" />
          <Text style={styles.infoText}>User ID: #{user.id}</Text>
        </View>
      </View>

      {/* Security Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Management</Text>

        <Text style={styles.inputLabel}>Current Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter current password"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />

        <Text style={styles.inputLabel}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new password (min 6 chars)"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Text style={styles.inputLabel}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Repeat new password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.disabledBtn]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Return to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1e9ff',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#005b9f',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  roleBadge: {
    backgroundColor: '#ebf8ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#bee3f8',
  },
  roleText: {
    color: '#2c5282',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusSubtext: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#4a5568',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2d3748',
  },
  saveBtn: {
    backgroundColor: '#005b9f',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  backBtnText: {
    color: '#718096',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
