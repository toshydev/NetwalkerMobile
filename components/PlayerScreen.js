import {Card} from "react-native-paper";
import {StyleSheet, Text, View} from "react-native";
import {theme} from "../theme";

export default function PlayerScreen() {
    return (
        <Card style={styles.container}>
            <Text style={{color: theme.colors.secondary}}>Player</Text>
        </Card>
    )
}
const styles = StyleSheet.create({
    container: {
        gridGap: 20,
        width: "95%",
        height: "95%",
        margin: 0,
        backgroundColor: theme.colors.primary,
    }
})
