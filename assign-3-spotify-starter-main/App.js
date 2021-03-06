import * as React from 'react';
import { StyleSheet, Text, SafeAreaView,
  View,
  Platform,
  TouchableOpacity,
  Image, Pressable, FlatList} from "react-native";
import { useState, useEffect } from "react";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import { myTopTracks, albumTracks } from "./utils/apiOptions";
import { REDIRECT_URI, SCOPES, CLIENT_ID, ALBUM_ID } from "./utils/constants";
import SongList from './SongList';
import Song from './Song';
import { Colors } from './Themes';
import { Images } from './Themes';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SongDetails from './SongDetails';
import SongPreview from './SongPreview';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

// Endpoints for authorizing with Spotify
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token"
};


const Stack = createStackNavigator();

export default function App() {
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: CLIENT_ID,
      scopes: SCOPES,
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: REDIRECT_URI
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      setToken(access_token);
    }
  }, [response]);

  useEffect(() => {
    if (token) {

      // Comment out the one you are not using
      myTopTracks(setTracks, token);
      // albumTracks(ALBUM_ID, setTracks, token);
    }
  }, [token]);

  const SpotButton = () => {
    return(
      <Pressable style = {styles.button}
        onPress={() => promptAsync()}>
          <View style={styles.flexparent}>
            <Image source={Images.spotify} style={styles.logo}/>
            <Text style = {styles.text}>CONNECT WITH SPOTIFY</Text>
          </View>
      </Pressable>
    );
  }

  let contentDisplayed = null;

  if (token) {
    contentDisplayed = <SongList data={tracks}/>
  } else {
    contentDisplayed = <SpotButton/>
  }

  function HomeScreen({ navigation }) {
    return (
      <SafeAreaView style={styles.container}>
        {contentDisplayed}
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerStyle: {backgroundColor: Colors.background},
                                      headerTitleStyle: {color: 'white'}}}>
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
        <Stack.Screen name="SongDetails" component={SongDetails} options={{title: 'Song Details', headerBackTitle: 'Back'}}/>
        <Stack.Screen name="SongPreview" component={SongPreview} options={{title: 'Song Preview', headerBackTitle: 'Back'}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  button: {
    borderRadius: 99999,
    backgroundColor: Colors.spotify,
    padding: 10,

  },
  text: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Arial Rounded MT Bold',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 5
  },
  flexparent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
});
