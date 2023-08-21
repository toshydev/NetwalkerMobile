import {Button, Card, TextInput} from "react-native-paper";
import {StyleSheet, Text, View} from "react-native";
import {theme} from "../theme";
import {useEffect, useState} from "react";
import {useStore} from "../hooks/useStore";
import useSound from "../utils/useSound";
import axios from "axios";

export default function LoginScreen({navigation}) {
    const [newUser, setNewUser] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const buttonDisabled = username === "" || password === ""
    const login = useStore(state => state.login)
    const getUser = useStore(state => state.getUser)
    const initializeXsrfToken = useStore(state => state.initializeXsrfToken)

    const playSuccess = useSound(require("../assets/sounds/login_success.mp3"));
    const playError = useSound(require("../assets/sounds/error.mp3"));

    useEffect(() => {
        getUser()
    }, []);

    async function handleLogin() {
        const basicAuth = btoa(username + ":" + password)
        login(basicAuth, playSuccess, playError)
    }

    return (
        <View style={styles.container}>
            <TextInput {...textInputProps} style={styles.textInput} label={<Text style={styles.label}>Username</Text> } onChangeText={(text) => setUsername(text)} value={username}/>
            <TextInput {...textInputProps} secureTextEntry={!showPassword} style={styles.textInput} label={<Text style={styles.label}>Password</Text> } onChangeText={(text) => setPassword(text)} value={password} right={<TextInput.Icon icon="eye" color={showPassword ? theme.colors.accent : theme.colors.secondary} onPress={() => setShowPassword(!showPassword)}/>}/>
            <Button mode="contained-tonal" {...buttonProps} style={styles.button} onPress={handleLogin} disabled={false}>Login</Button>
        </View>
    )
}

const textInputProps = {
    cursorColor: theme.colors.accent,
    underlineColor: theme.colors.secondary,
    selectionColor: theme.colors.accent,
    textColor: theme.colors.accent,
}

const buttonProps = {
    buttonColor: theme.colors.secondary,
    textColor: theme.colors.background,
    uppercase: true
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
        margin: 0,
        padding: 0,
        backgroundColor: theme.colors.primary,
    },
    textInput: {
        width: "80%",
        height: 75,
        backgroundColor: theme.colors.background,
        marginTop: 25,
        borderColor: theme.colors.secondary,
        borderWidth: 2,
        fontSize: 24,
    },
    label: {
        color: theme.colors.secondary,
        fontSize: 24,
    },
    button: {
        width: "80%",
        height: 75,
        borderColor: theme.colors.background,
        borderWidth: 2,
        fontSize: 24,
        borderRadius: 12,
        marginTop: "auto",
        marginBottom: 35,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
})
