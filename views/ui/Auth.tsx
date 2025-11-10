import React, { useState } from 'react';
import { Alert, StyleSheet, View, AppState, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';

import { SignInForm } from '@/views/sign-in-form';

export default function Auth() {
  return <SignInForm />;
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});
