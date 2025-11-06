
import { StyleSheet } from 'react-native';

const form_style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: '#00FFAA',
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  subtitle: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderColor: '#00FFAA',
    borderWidth: 2,

    color: 'white',
    borderRadius: 8,
    fontFamily: 'PressStart2P',
    fontSize: 10,
    padding: 12,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: '#00FFAA',
  },
  continueButton: {
  backgroundColor: '#FFA726',
  borderColor: '#C35C00',
  borderWidth: 3,
  borderRadius: 12,
  paddingVertical: 14,
  alignItems: 'center',
  marginTop: 8,
  shadowColor: '#6A1B9A',
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
},
continueButtonDisabled: {
  backgroundColor: '#CC8855',
  opacity: 0.6,
},
continueButtonText: {
  fontFamily: 'PressStart2P',
  fontSize: 12,
  color: '#3B0A00',
  textAlign: 'center',
},
  signupPrompt: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  signupLink: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#00FFAA',
    textAlign: 'center',
  },

  backButton: {
    backgroundColor: '#FFA726',
    borderColor: '#FF4081',
    borderWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 32,
  },
  backButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#3B0A00',
    textAlign: 'center',
  },
});

export { form_style }
