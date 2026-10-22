/**
 * SCREEN — LoginScreen
 * Login de passageiro, motorista ou admin.
 * Equivalente web: static/login.html
 */
import { StyleSheet, Text } from 'react-native';

import Label from '../components/atoms/Label';
import LoginForm from '../components/organisms/LoginForm';
import CenteredTemplate from '../components/templates/CenteredTemplate';
import { useAuth } from '../contexts/AuthContext';
import { espacos } from '../theme';

export default function LoginScreen() {
  const { entrar } = useAuth();
  return (
    <CenteredTemplate>
      <Text style={styles.logo}>🚌</Text>
      <Label variante="titulo" style={styles.centro}>
        BusZapp
      </Label>
      <Label variante="legenda" style={[styles.centro, styles.subtitulo]}>
        Entre com seu e-mail e senha
      </Label>
      <LoginForm aoEntrar={entrar} />
    </CenteredTemplate>
  );
}

const styles = StyleSheet.create({
  logo: { fontSize: 56, textAlign: 'center' },
  centro: { textAlign: 'center' },
  subtitulo: { marginBottom: espacos.xl },
});
