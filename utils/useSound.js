import { Audio } from 'expo-av';
import {useEffect, useState} from "react";

export default function useSound(path) {
    const [sound, setSound] = useState(null);

    async function playSound() {
        console.log('Loading Sound');
        const { sound } = await Audio.Sound.createAsync(path);
        setSound(sound);

        console.log('Playing Sound');
        await sound.playAsync();
    }

    useEffect(() => {
        return sound
            ? () => {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    return playSound
}
