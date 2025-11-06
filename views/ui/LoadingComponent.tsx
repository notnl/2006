
import { View } from 'react-native';

import { ActivityIndicator } from 'react-native';

export default function Loading() {
    return (
      <ImageBackground
        source={require('@/assets/images/bg-city.png')}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00FFAA" />
          <Text style={{ marginTop: 16, color: 'white', fontFamily: 'PressStart2P', fontSize: 8 }}>
            Loading...
          </Text>
        </View>
      </ImageBackground>
    );
  
}
