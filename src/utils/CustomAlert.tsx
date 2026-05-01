import React, { useState, forwardRef, useImperativeHandle, createRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export const customAlertRef = createRef<any>();

export const CustomAlertComponent = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');
  const [buttons, setButtons] = useState<any[]>([]);

  useImperativeHandle(customAlertRef, () => ({
    alert: (title: string, message?: string, btns?: any[]) => {
      setModalTitle(title || '');
      setModalMessage(message || '');
      
      // Determine type based on title for some automatic styling
      let type: 'success' | 'error' | 'info' = 'info';
      if (title?.toLowerCase().includes('success')) type = 'success';
      if (title?.toLowerCase().includes('error') || title?.toLowerCase().includes('failed')) type = 'error';
      setModalType(type);

      if (btns && btns.length > 0) {
        setButtons(btns);
      } else {
        // Default button if none provided
        setButtons([
          {
            text: type === 'success' ? 'Great!' : 'Close',
            onPress: () => {},
            style: type === 'success' ? 'default' : 'cancel',
          },
        ]);
      }
      setModalVisible(true);
    },
    close: () => {
      setModalVisible(false);
    }
  }));

  const handleButtonPress = (btn: any) => {
    setModalVisible(false);
    if (btn.onPress) {
      // Add a small delay to allow modal to close before executing action
      setTimeout(() => {
        btn.onPress();
      }, 100);
    }
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {!!modalTitle && <Text style={styles.modalTitle}>{modalTitle}</Text>}
          {!!modalMessage && <Text style={styles.modalMessage}>{modalMessage}</Text>}

          <View style={styles.modalFooter}>
            {buttons.map((btn, index) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              
              let bgColor = '#487D44'; // Default Green
              if (isCancel) bgColor = '#9CA3AF'; // Gray
              if (isDestructive || modalType === 'error') bgColor = '#EF4444'; // Red

              // Override if multiple buttons to make it look balanced
              if (buttons.length === 2 && index === 0 && !btn.style) {
                 bgColor = '#9CA3AF'; // First button usually cancel/secondary
              }

              return (
                <TouchableOpacity
                  key={index.toString()}
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor: bgColor,
                      width: buttons.length === 1 ? '100%' : `${100 / buttons.length - 5}%`,
                      marginHorizontal: buttons.length > 1 ? 5 : 0,
                    },
                  ]}
                  onPress={() => handleButtonPress(btn)}
                >
                  <Text style={styles.modalButtonText}>{btn.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Exporting an object that mimics react-native's Alert
export const Alert = {
  alert: (title: string, message?: string, buttons?: any[]) => {
    if (customAlertRef.current) {
      customAlertRef.current.alert(title, message, buttons);
    } else {
      console.warn('CustomAlertComponent is not mounted. Ensure it is rendered in App.tsx');
    }
  },
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    fontWeight: '600',
  },
});
