import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { buildApiUrl } from './apiConfig';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const teamMembers = [
    { name: "KWAME OFOSU Grant", role: "AI Lead & Backend", image: require('../assets/team1.png') },
    { name: "BEMAH Regina", role: "UI/UX & Frontend", image: require('../assets/team2.png') },
  ];
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );
  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('userData');
      if (!userData) {
        router.replace('/login');
        return;
      }
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      if (parsedUser.role === 'SPECIALIST') {
        fetchSpecialistCases();
      } else {
        fetchDoctorHistory();
      }
    } catch (error) {
      router.replace('/login');
    }
  };

  const fetchDoctorHistory = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(buildApiUrl('/api/doctor/history/'), {
        headers: { 'Authorization': `Token ${token}` }
      });
      setReferralHistory(response.data);
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialistCases = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.get(buildApiUrl('/api/specialist/cases/'), {
        headers: { 'Authorization': `Token ${token}` }
      });
      setCases(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not load cases.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#005b9f" />
      </View>
    );
  }

  // SPECIALIST VIEW
  if (user?.role === 'SPECIALIST') {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#005b9f', '#004275']} style={styles.specHeader}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.specWelcome}>Specialist Portal</Text>
              <Text style={styles.specName}>Dr. {user.username}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => router.push('/profile')} style={styles.logoutBtnSmall}>
                <Ionicons name="person-circle-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtnSmall}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referrals for Review ({cases.length})</Text>
          {cases.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="mail-open-outline" size={60} color="#cbd5e0" />
              <Text style={styles.emptyText}>No pending referrals</Text>
            </View>
          ) : (
            cases.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.caseCard}
                onPress={() => router.push({ 
                  pathname: '/results', 
                  params: { 
                    ...item, 
                    probabilities: JSON.stringify({
                      glaucoma: item.glaucoma_prob ?? 0,
                      normal: item.normal_prob ?? 0,
                    }),
                    doctor_name: item.doctor_name,
                  } 
                })}
              >
                <View style={styles.caseInfo}>
                  <Text style={styles.casePatient}>{item.patient_name}</Text>
                  <Text style={styles.caseDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.badge, item.prediction === 'glaucoma' ? styles.badgeRed : styles.badgeGreen]}>
                  <Text style={styles.badgeText}>{item.prediction.toUpperCase()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  // DOCTOR VIEW (ORIGINAL)
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient 
        colors={['#E6F4FE', '#ffffff']} 
        style={styles.heroSection}
      >
        <View style={styles.headerBtnsDoctor}>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.headerBtn}>
            <Ionicons name="person-circle-outline" size={26} color="#005b9f" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerBtn}>
            <Ionicons name="log-out-outline" size={26} color="#005b9f" />
          </TouchableOpacity>
        </View>
        <Image 
          source={require('../assets/hero.png')} 
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroContent}>
          <Text style={styles.title}>Glauco-Guard AI</Text>
          <Text style={styles.welcomeDoc}>Welcome, Dr. {user?.username}</Text>
          <Text style={styles.subtitle}>
            Analyze retinal scans and refer critical cases to specialists instantly.
          </Text> 
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => router.push('/scan')}
          >
            <Text style={styles.buttonText}>Open Scanner</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Referral History Section */}
      <View style={styles.section}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Referral History</Text>
          <View style={styles.historyBadge}>
            <Text style={styles.historyBadgeText}>{referralHistory.length} Cases</Text>
          </View>
        </View>

        {referralHistory.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="document-text-outline" size={48} color="#cbd5e0" />
            <Text style={styles.emptyHistoryText}>No diagnoses yet</Text>
            <Text style={styles.emptyHistorySub}>Scanned cases will appear here</Text>
          </View>
        ) : (
          referralHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.historyCard}
              onPress={() => router.push({
                pathname: '/results',
                params: {
                  prediction: item.prediction,
                  confidence: item.confidence,
                  diagnosis_id: item.id,
                  patient_name: item.patient_name,
                  patient_phone: item.patient_phone,
                  doctor_notes: item.doctor_notes,
                  referral_notes: item.referral_notes,
                  image: item.image,
                  model_used: item.model_used,
                  probabilities: JSON.stringify({
                    glaucoma: item.glaucoma_prob ?? 0,
                    normal: item.normal_prob ?? 0,
                  }),
                }
              })}
            >
              <View style={[styles.historyIcon, { backgroundColor: item.prediction === 'glaucoma' ? '#fff5f5' : '#f0fff4' }]}>
                <Ionicons
                  name={item.prediction === 'glaucoma' ? 'warning' : 'checkmark-circle'}
                  size={24}
                  color={item.prediction === 'glaucoma' ? '#e53e3e' : '#38a169'}
                />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyPatient}>{item.patient_name}</Text>
                <Text style={styles.historyMeta}>
                  {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
                {item.is_referred && (
                  <View style={styles.referredTag}>
                    <Ionicons name="arrow-redo" size={10} color="#3182ce" />
                    <Text style={styles.referredTagText}>Referred to {item.specialist_name || 'Specialist'}</Text>
                  </View>
                )}
              </View>
              <View style={styles.historyRight}>
                <Text style={[styles.historyResult, { color: item.prediction === 'glaucoma' ? '#e53e3e' : '#38a169' }]}>
                  {item.prediction === 'glaucoma' ? 'GLAUCOMA' : 'NO GLAUCOMA'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#a0aec0" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Technology</Text>
        <View style={styles.techCard}>
          <Text style={styles.techText}>
            Our clinical system is powered by a state-of-the-art Vision Transformer (ViT-B/16) AI classification engine, offering ophthalmologists highly reliable attention-based deep learning screenings.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Developers</Text>
        <View style={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.memberCard}>
              <Image source={member.image} style={styles.memberImage} />
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Glauco-Guard Final Year Project</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroImage: {
    width: width * 0.85,
    height: 220,
    borderRadius: 24,
    marginBottom: 24,
  },
  heroContent: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#005b9f',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  primaryButton: {
    backgroundColor: '#005b9f',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#005b9f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    padding: 24,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 20,
  },
  techCard: {
    backgroundColor: '#F7FAFC',
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#005b9f',
  },
  techText: {
    color: '#4A5568',
    lineHeight: 22,
    fontSize: 15,
  },
  teamGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  memberCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  memberImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
  },
  memberRole: {
    fontSize: 12,
    color: '#005b9f',
    textAlign: 'center',
    marginTop: 2,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#A0AEC0',
    fontSize: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  specHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specWelcome: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  specName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoutBtnSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtnsDoctor: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#edf2f7',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  caseInfo: {
    flex: 1,
  },
  casePatient: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  caseDate: {
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  badgeRed: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#feb2b2',
  },
  badgeGreen: {
    backgroundColor: '#f0fff4',
    borderWidth: 1,
    borderColor: '#9ae6b4',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#a0aec0',
    fontSize: 16,
  },
  welcomeDoc: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyBadge: {
    backgroundColor: '#ebf8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bee3f8',
  },
  historyBadgeText: {
    fontSize: 12,
    color: '#2c5282',
    fontWeight: 'bold',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#edf2f7',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  historyInfo: {
    flex: 1,
  }, 
  historyPatient: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  historyMeta: {
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 2,
  },
  referredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  referredTagText: {
    fontSize: 11,
    color: '#3182ce',
    fontWeight: '600',
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyResult: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a0aec0',
    marginTop: 12,
  },
  emptyHistorySub: {
    fontSize: 13,
    color: '#cbd5e0',
    marginTop: 4,
  },
});
