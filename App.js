import {StatusBar} from 'expo-status-bar';
import {SafeAreaView, Platform} from 'react-native';
import {Button, PaperProvider} from "react-native-paper";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from "./components/LoginScreen";
import ListScreen from "./components/ListScreen";
import NavBar from "./components/NavBar";
import {theme} from "./theme";
import PlayerScreen from "./components/PlayerScreen";
import {useEffect, useState} from "react";
import {useFonts} from "expo-font";
import * as React from 'react';
import useSound from "./utils/useSound";
import axios from "axios";
import {useStore} from "./hooks/useStore";
import {decode, encode} from 'base-64'
import AsyncStorage from "@react-native-async-storage/async-storage";

global.Buffer = require('buffer').Buffer;
if (!global.btoa) {
    global.btoa = encode;
}

if (!global.atob) {
    global.atob = decode;
}

const Stack = createStackNavigator();
const platform = Platform.OS

export default function App() {
    const [loadedFonts] = useFonts({
        "NerdFont": require("./assets/fonts/3270/3270NerdFont-Regular.ttf"),
    });
    const initializeXsrfToken = useStore(state => state.initializeXsrfToken)
    const isLoading = useStore(state => state.isLoading)
    const user = useStore(state => state.user)
    const getUser = useStore(state => state.getUser)
    const isAuthenticated = user !== "anonymousUser" && user !== ""

    const playClick = useSound(require("./assets/sounds/click.mp3"));

    useEffect(() => {
        initializeXsrfToken()
        getUser()
    }, [])

    if (!loadedFonts) {
        return null
    }

    return (
        <PaperProvider theme={theme}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{header: (props) => <NavBar {...props}/>}}
                                 initialRouteName={isAuthenticated ? "Home" : "Login"}>
                    <Stack.Screen name="Login" component={LoginScreen}/>
                    <Stack.Screen name="Home" component={ListScreen}/>
                    <Stack.Screen name="Player" component={PlayerScreen}/>
                </Stack.Navigator>
            </NavigationContainer>
            {platform === "ios" ? <SafeAreaView style={{backgroundColor: theme.colors.background}}>
                <StatusBar style="light"/>
            </SafeAreaView> : null}
            <Button onPress={playClick}>Play Sound for {user}</Button>
        </PaperProvider>
    );
}
