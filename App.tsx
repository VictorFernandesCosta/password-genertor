import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateRandomPassword } from './utils/passwordGenerator';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Função de validação de email
  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleLogin = () => {
    if (validateEmail(email) && password.length >= 8) {
      // Se o email for válido e a senha tiver 8 caracteres, navega para a tela de geração de senha
      navigation.navigate('Home');
    } else {
      Alert.alert('Erro', 'Por favor, insira um email válido e uma senha com no mínimo 8 caracteres.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/images/padlock.png')} style={styles.padlockImage} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const HomeScreen = ({ navigation }: any) => {
  const [passwordLength, setPasswordLength] = useState<number>(8);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const handleGeneratePassword = () => {
    const password = generateRandomPassword(passwordLength);
    setGeneratedPassword(password);
    setIsModalVisible(true);
  };

  const savePassword = async () => {
    try {
      const savedPasswords = await AsyncStorage.getItem('savedPasswords');
      const passwords = savedPasswords ? JSON.parse(savedPasswords) : [];
      passwords.push(generatedPassword);
      await AsyncStorage.setItem('savedPasswords', JSON.stringify(passwords));
      setIsModalVisible(false);
      alert('Senha Salva!');
    } catch (error) {
      console.error('Erro ao salvar senha:', error);
    }
  };

  return (
    <View style={styles.container}>
        <Image 
        source={require('./assets/images/padlock.png')} 
        style={styles.image}
      />
      <Text style={styles.title}>{passwordLength} Caracteres</Text>
      <Slider
        style={{ width: 300, height: 40 }}
        minimumValue={8}
        maximumValue={16}
        step={1}
        value={passwordLength}
        onValueChange={setPasswordLength}
        minimumTrackTintColor="#1EB1FC"
        maximumTrackTintColor="#000000"
      />
      <TouchableOpacity style={styles.button} onPress={handleGeneratePassword}>
        <Text style={styles.buttonText}>Gerar senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SavedPasswords')}>
        <Text style={styles.buttonText}>Minhas senhas salvas</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Senha Gerada</Text>
            <Text style={styles.generatedPassword}>{generatedPassword}</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={savePassword}>
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const SavedPasswordsScreen = () => {
  const [savedPasswords, setSavedPasswords] = useState<string[]>([]);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean[]>([]);


  // Carregar senhas salvas do AsyncStorage
  const loadSavedPasswords = async () => {
    try {
      const passwords = await AsyncStorage.getItem('savedPasswords');
      if (passwords) {
        const parsedPasswords = JSON.parse(passwords);
        setSavedPasswords(parsedPasswords);
        setIsPasswordVisible(Array(parsedPasswords.length).fill(false)); // Inicializar o estado das senhas ocultas
      }
    } catch (error) {
      console.error('Erro ao carregar senhas salvas:', error);
    }
  };

  // Alternar visibilidade da senha
  const togglePasswordVisibility = (index: number) => {
    const updatedVisibility = [...isPasswordVisible];
    updatedVisibility[index] = !updatedVisibility[index];
    setIsPasswordVisible(updatedVisibility);
  };

  useEffect(() => {
    loadSavedPasswords();
  }, []);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas senhas salvas</Text>
      <FlatList
        data={savedPasswords}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.passwordItem}>
            <Text style={styles.passwordText}>
              {isPasswordVisible[index] ? item : '****'} {/* Exibir senha ou mascarar */}
            </Text>
            <TouchableOpacity onPress={() => togglePasswordVisibility(index)}>
              <Ionicons
                name={isPasswordVisible[index] ? 'eye-off' : 'eye'}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SavedPasswords" component={SavedPasswordsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1EB1FC',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    marginHorizontal: 10, // Adiciona espaçamento horizontal entre os botões
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 50,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  generatedPassword: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Isso vai garantir que os botões fiquem espaçados
    width: '100%', // Garante que os botões ocupem todo o espaço disponível no modal
    paddingHorizontal: 20, // Espaçamento interno das bordas
  },
  passwordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
  },
  passwordText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 100,  
    height: 100,
    marginBottom: 20, 
  },
  padlockImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default App;
