import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Modal, Image, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { buildApiUrl } from './apiConfig';

export default function Results() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { prediction, confidence, diagnosis_id, model_used } = params;
  
  const [userRole, setUserRole] = useState('DOCTOR');
  const [patientName, setPatientName] = useState(params.patient_name || 'Unknown Patient');
  const [patientPhone, setPatientPhone] = useState(params.patient_phone || '');
  const [doctorNotes, setDoctorNotes] = useState(params.doctor_notes || '');
  const [referralNotes, setReferralNotes] = useState(params.referral_notes || '');
  const [doctorName, setDoctorName] = useState(params.doctor_name || 'Medical Staff');
  const [imageUrl, setImageUrl] = useState(params.image || null);
  const [updating, setUpdating] = useState(false);
  
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [referring, setReferring] = useState(false);
  const [newReferralNotes, setNewReferralNotes] = useState('');
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const isPositive = prediction === 'glaucoma';

  let probabilities = { glaucoma: 0, normal: 0 };
  try {
    if (typeof params.probabilities === 'string') {
      probabilities = JSON.parse(params.probabilities);
    } else if (params.probabilities) {
      probabilities = params.probabilities;
    }
  } catch (e) {
    console.error("Error parsing probabilities:", e);
  }

  useEffect(() => {
    checkRoleAndLoad();
  }, []);

  const checkRoleAndLoad = async () => {
    const userData = await SecureStore.getItemAsync('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserRole(parsedUser.role);
      if (parsedUser.role === 'DOCTOR') {
        fetchSpecialists();
      }
    }
  };

  const getFullImageUrl = () => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${buildApiUrl('')}${imageUrl}`;
  };

  const fetchSpecialists = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(buildApiUrl('/api/specialist/list/'), {
        headers: { 'Authorization': `Token ${token}` }
      });
      setSpecialists(response.data);
    } catch (error) {
      console.error("Error fetching specialists:", error);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.patch(buildApiUrl(`/api/diagnosis/${diagnosis_id}/`), {
        patient_name: patientName,
        patient_phone: patientPhone,
        doctor_notes: doctorNotes,
      }, {
        headers: { 'Authorization': `Token ${token}` }
      });
      Alert.alert("Success", "Patient data updated successfully.");
    } catch (error) {
      Alert.alert("Error", "Failed to update patient data.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCall = () => {
    if (patientPhone) {
      Linking.openURL(`tel:${patientPhone}`);
    } else {
      Alert.alert("Error", "No phone number available for this patient.");
    }
  };

  const handleRefer = async () => {
    if (!selectedSpecialist) {
      Alert.alert("Select Specialist", "Please select a specialist from the list.");
      return;
    }

    setReferring(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.post(buildApiUrl(`/api/diagnosis/${diagnosis_id}/refer/`), {
        specialist_id: selectedSpecialist.id,
        referral_notes: newReferralNotes,
      }, {
        headers: { 'Authorization': `Token ${token}` }
      });
      Alert.alert("Referral Sent", `Case referred to ${selectedSpecialist.username}`);
    } catch (error) {
      Alert.alert("Error", "Failed to refer case.");
    } finally {
      setReferring(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.statusCard, isPositive ? styles.statusWarning : styles.statusSafe]}>
        <View style={styles.iconCircle}>
          <Ionicons 
            name={isPositive ? "warning" : "checkmark-circle"} 
            size={48} 
            color={isPositive ? "#e53e3e" : "#38a169"} 
          />
        </View> 
        <Text style={styles.resultValue}>
          {isPositive ? 'Potential Glaucoma Detected' : 'No Signs of Glaucoma'}
        </Text> 
        <Text style={styles.resultSub}>Case ID: #{diagnosis_id}</Text>
      </View>

      <View style={styles.reportSection}>
        <View style={styles.sectionHeaderRow}>
           <Text style={styles.sectionTitle}>Patient Information</Text>
           <View style={{ flexDirection: 'row', gap: 10 }}>
             {userRole === 'SPECIALIST' && patientPhone && (
               <TouchableOpacity style={[styles.viewScanBtn, { borderColor: '#38a169', backgroundColor: '#f0fff4' }]} onPress={handleCall}>
                 <Ionicons name="call-outline" size={16} color="#38a169" />
                 <Text style={[styles.viewScanText, { color: '#38a169' }]}>Call Patient</Text>
               </TouchableOpacity>
             )}
             {imageUrl && (
               <TouchableOpacity style={styles.viewScanBtn} onPress={() => setImageModalVisible(true)}>
                 <Ionicons name="eye-outline" size={16} color="#005b9f" />
                 <Text style={styles.viewScanText}>View Scan</Text>
               </TouchableOpacity>
             )}
           </View>
        </View>
        
        {userRole === 'DOCTOR' ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Patient Name</Text>
              <TextInput 
                style={styles.textInput} 
                value={patientName} 
                onChangeText={setPatientName}
                placeholder="Enter Patient Name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Patient Phone Number</Text>
              <TextInput 
                style={styles.textInput} 
                value={patientPhone} 
                onChangeText={setPatientPhone}
                placeholder="+233 XXX XXX XXX"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Doctor's Clinical Notes</Text>
              <TextInput 
                style={[styles.textInput, styles.textArea]} 
                value={doctorNotes} 
                onChangeText={setDoctorNotes}
                placeholder="Enter clinical observations..."
                multiline
              />
            </View>
            <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} disabled={updating}>
              {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateBtnText}>Save Patient Data</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.readOnlyBox}>
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>Patient Name:</Text>
              <Text style={styles.readOnlyValue}>{patientName}</Text>
            </View>
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>Patient Contact:</Text>
              <Text style={[styles.readOnlyValue, { color: '#3182ce' }]}>{patientPhone || "Not provided"}</Text>
            </View>
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>Referring Physician:</Text>
              <Text style={styles.readOnlyValue}>Dr. {doctorName}</Text>
            </View>
            <View style={styles.readOnlyRowVertical}>
              <Text style={styles.readOnlyLabel}>Clinical Notes:</Text>
              <Text style={styles.readOnlyText}>{doctorNotes || "No notes provided."}</Text>
            </View>
            {referralNotes ? (
              <View style={[styles.readOnlyRowVertical, styles.referralContext]}>
                <Text style={[styles.readOnlyLabel, {color: '#2c5282'}]}>Referral Instruction:</Text>
                <Text style={styles.readOnlyText}>{referralNotes}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.reportSection}>
        <Text style={styles.sectionTitle}>AI Analysis Details</Text>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>AI Model Used</Text>
          <Text style={[styles.dataValue, { color: '#005b9f', fontWeight: 'bold' }]}>
            {model_used === 'ResNet' ? 'ResNet CNN 🧠' : 'Vision Transformer (ViT) ⚡'}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Confidence</Text>
          <Text style={styles.dataValue}>{confidence}%</Text>
        </View>
        <View style={styles.probContainer}>
          <View style={styles.probTextRow}>
            <Text style={styles.probText}>Glaucoma: {probabilities.glaucoma}%</Text>
            <Text style={styles.probText}>Normal: {probabilities.normal}%</Text>
          </View>
        </View>
      </View>

      {userRole === 'DOCTOR' && (
        <View style={styles.referralSection}>
          <Text style={styles.sectionTitle}>Refer to Specialist</Text>
          <Text style={styles.inputLabel}>Select Specialist (Available first)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialistScroll}>
            {specialists.map(spec => (
              <TouchableOpacity 
                key={spec.id} 
                style={[
                  styles.specChip, 
                  selectedSpecialist?.id === spec.id && styles.specChipSelected,
                  !spec.is_available && { opacity: 0.6 }
                ]}
                onPress={() => setSelectedSpecialist(spec)}
              >
                <View style={[styles.statusDot, { backgroundColor: spec.is_available ? '#38a169' : '#cbd5e0' }]} />
                <Text style={[styles.specChipText, selectedSpecialist?.id === spec.id && styles.specChipTextSelected]}>
                  {spec.username} {spec.is_available ? "" : "(Busy)"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput 
            style={[styles.textInput, styles.textArea, { marginTop: 15 }]} 
            value={newReferralNotes} 
            onChangeText={setNewReferralNotes}
            placeholder="Reason for referral..."
            multiline
          />

          <TouchableOpacity style={styles.referBtn} onPress={handleRefer} disabled={referring}>
            {referring ? <ActivityIndicator color="#fff" /> : <Text style={styles.referBtnText}>Send to Specialist</Text>}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={styles.actionBtn} 
        onPress={() => router.dismissAll()}
      >
        <Text style={styles.actionBtnText}>{userRole === 'SPECIALIST' ? 'Back to Inbox' : 'Finish Consultation'}</Text>
      </TouchableOpacity>

      <Modal visible={imageModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setImageModalVisible(false)}>
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            <Image 
              source={{ uri: getFullImageUrl() }} 
              style={styles.fullImage} 
              resizeMode="contain" 
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 60 },
  statusCard: { padding: 30, borderRadius: 32, alignItems: 'center', marginBottom: 32 },
  statusWarning: { backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#feb2b2' },
  statusSafe: { backgroundColor: '#f0fff4', borderWidth: 1, borderColor: '#9ae6b4' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  resultValue: { fontSize: 22, fontWeight: 'bold', color: '#1a202c', textAlign: 'center' },
  resultSub: { fontSize: 14, color: '#718096', marginTop: 6 },
  reportSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2d3748', marginBottom: 20 },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
  dataLabel: { fontSize: 16, color: '#4a5568' },
  dataValue: { fontSize: 16, fontWeight: 'bold', color: '#2d3748' },
  actionBtn: { backgroundColor: '#005b9f', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  actionBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#4a5568', marginBottom: 8 },
  textInput: { backgroundColor: '#f7fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 16, color: '#2d3748' },
  textArea: { height: 100, textAlignVertical: 'top' },
  updateBtn: { backgroundColor: '#3182ce', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  updateBtnText: { color: '#fff', fontWeight: 'bold' },
  referralSection: { backgroundColor: '#ebf8ff', padding: 20, borderRadius: 24, marginBottom: 32, borderWidth: 1, borderColor: '#bee3f8' },
  specialistScroll: { flexDirection: 'row', marginTop: 10 },
  specChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#bee3f8', gap: 6 },
  specChipSelected: { backgroundColor: '#005b9f', borderColor: '#005b9f' },
  specChipText: { fontSize: 14, color: '#005b9f', fontWeight: '600' },
  specChipTextSelected: { color: '#fff' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  referBtn: { backgroundColor: '#2c5282', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  referBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  readOnlyBox: { backgroundColor: '#f7fafc', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  readOnlyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  readOnlyRowVertical: { marginBottom: 15 },
  readOnlyLabel: { fontSize: 13, color: '#718096', fontWeight: 'bold', marginBottom: 4 },
  readOnlyValue: { fontSize: 16, color: '#2d3748', fontWeight: '600' },
  readOnlyText: { fontSize: 15, color: '#4a5568', lineHeight: 22 },
  referralContext: { backgroundColor: '#fff', padding: 12, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#3182ce', marginTop: 5 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  viewScanBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f4fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: '#005b9f' },
  viewScanText: { color: '#005b9f', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalCloseBtn: { position: 'absolute', top: 50, right: 30, zIndex: 10 },
  modalContent: { width: '90%', height: '70%' },
  fullImage: { width: '100%', height: '100%' },
  probContainer: { marginTop: 15 },
  probTextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  probText: { fontSize: 12, color: '#718096' }
});
