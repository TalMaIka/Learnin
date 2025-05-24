import React, { useState } from 'react';
import { SafeAreaView, Button, View } from 'react-native';
import RegisterScreen from './RegisterScreen';
import LoginScreen from './LoginScreen';

export default function App() {
  const [showRegister, setShowRegister] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10 }}>
        <Button title="Register" onPress={() => setShowRegister(true)} />
        <Button title="Login" onPress={() => setShowRegister(false)} />
      </View>
      {showRegister ? <RegisterScreen /> : <LoginScreen />}
    </SafeAreaView>
  );
}
