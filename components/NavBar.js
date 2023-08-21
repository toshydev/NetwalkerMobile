import {Appbar} from "react-native-paper";
import IntelligenceIcon from "../assets/intelligence.png";
import DefaultAvatar from "../assets/defaultAvatar.webp";
import {theme} from "../theme";
import {getHeaderTitle} from '@react-navigation/elements';


export default function NavBar({navigation, route, options, back}) {
    const title = getHeaderTitle(options, route.name)

    return (
        <Appbar.Header theme={theme} style={{backgroundColor: theme.colors.background}} mode={"small"}>
            {back ? <Appbar.BackAction onPress={navigation.goBack} iconColor={theme.colors.secondary} style={{marginRight: 0}}/> : null}
            <Appbar.Action icon={IntelligenceIcon} iconColor={theme.colors.secondary} size={35} onPress={() => navigation.navigate("Home")} style={{marginLeft: 0}}/>
            <Appbar.Content title={title} color={theme.colors.secondary}/>
            <Appbar.Action icon={"message-text-outline"} iconColor={theme.colors.secondary}/>
            <Appbar.Action icon={DefaultAvatar} iconColor={theme.colors.secondary} size={35} onPress={() => navigation.navigate("Player")} />
        </Appbar.Header>
    )
}
