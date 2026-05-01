import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import Styles from '../components/Styles';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const generateDates = () => {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      day: DAY_NAMES[d.getDay()],
      date: String(d.getDate()).padStart(2, '0'),
      month: MONTH_NAMES[d.getMonth()],
      full: `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}/${String(d.getDate()).padStart(2, '0')}`,
    };
  });
};
const dates = generateDates();

export default function CheckoutScreen({ navigation }: any) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');

  // ── Modal state (same pattern as AddMoney) ──
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'inactive'>(
    'error',
  );
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (
    type: 'success' | 'error' | 'inactive',
    title: string,
    message: string,
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleVerify = () => {
    if (!selectedDate) {
      showModal('error', 'Required', 'Please select a delivery date');
      return;
    }
    console.log('Selected Date:', selectedDate);
    console.log('Delivery Instruction:', instruction);
    navigation.navigate('CheckoutAddressScreen', {
      delivery_date: selectedDate,
      delivery_instruction: instruction,
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header */}
      <Header title="Preferred Delivery Slot" backgroundColor="#F3F4F6" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, padding: 0 }}
        style={{ paddingHorizontal: 15 }}
      >
        {/* Date Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 0 }}
        >
          {dates.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedIndex(index);
                setSelectedDate(item.full);
              }}
              style={[
                styles.dateCard,
                selectedIndex === index && styles.activeDateCard,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedIndex === index && styles.activeText,
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedIndex === index && styles.activeText,
                ]}
              >
                {item.date}
              </Text>
              <Text
                style={[
                  styles.monthText,
                  selectedIndex === index && styles.activeText,
                ]}
              >
                {item.month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Delivery Instructions */}
        <Text style={styles.sectionTitle}>
          Delivery Instructions{' '}
          <Text
            style={{
              color: '#6B7280',
              fontSize: 14,
              fontFamily: 'DMSans-Regular',
            }}
          >
            (Optional)
          </Text>
        </Text>

        <TextInput
          placeholder="Write here..."
          placeholderTextColor="#9CA3AF"
          multiline
          style={styles.textArea}
          value={instruction}
          onChangeText={setInstruction}
        />

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Image
            source={require('../assets/Common/info.png')}
            style={{ height: 18, width: 18 }}
            resizeMode="contain"
          />
          <Text style={styles.infoText}>
            <Text
              style={{
                fontWeight: '600',
                fontFamily: 'DMSans-SemiBold',
                color: '#000',
                fontSize: 14,
              }}
            >
              B2B Priority :
            </Text>{' '}
            <Text style={styles.sText}>
              Early Morning slots are prioritized for restaurant partners to
              ensure inventory is ready before peak service hour.
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* Verify Button */}
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={Styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      {/* ──  Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor:
                      modalType === 'success' ? '#487D44' : '#EF4444',
                    width: '100%',
                  },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>
                  {modalType === 'success' ? 'Great!' : 'Close'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  button: {
    backgroundColor: '#487D44',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    left: 15,
    right: 15,
  },
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  activeDateCard: {
    backgroundColor: '#4F7D46',
    borderColor: '#4F7D46',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'DMSans-Regular',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'DMSans-SemiBold',
    marginVertical: 1,
  },
  monthText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'DMSans-Regular',
  },
  activeText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
    marginBottom: 8,
    marginTop: 15,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    height: 110,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#DCEFE2',
    padding: 14,
    borderRadius: 14,
    marginTop: 18,
  },
  sText: {
    color: '#64748B',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#2F6B3E',
    lineHeight: 18,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'DMSans-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },
});
