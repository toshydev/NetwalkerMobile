import {create} from "zustand";
import axios, { AxiosResponse } from "axios";
import {getDistanceBetweenCoordinates} from "../utils/calculation";
import {ActionType, Coordinates, ItemSize, Message, Node, NodeData, Player} from "../models";
import AsyncStorage from "@react-native-async-storage/async-storage";

type State = {
    initializeXsrfToken: () => void,
    toggleSortDirection: () => void;
    sortNodesByDistance: (position: { latitude: number, longitude: number }, nodes: Node[]) => Node[],
    sortDirection: "asc" | "desc",
    user: string,
    player: Player | null,
    nodes: Node[],
    isLoading: boolean,
    isScanning: boolean,
    getPlayer: () => void,
    getUser: () => void,
    getNodes: () => void,
    addNode: (nodeData: NodeData, onSuccess: () => void, onError: () => void) => void
    editNode: (nodeId: string, action: ActionType) => void
    deleteNode: (nodeId: string, onSuccess: () => void, onError: () => void) => void
    login: (basicAuth: string, onSuccess: () => void, onError: () => void) => void
    register: (username: string, email: string, password: string) => void
    logout: (onSuccess: () => void, onError: () => void) => void
    updateLocation: (coordinates: Coordinates) => void
    gps: boolean
    setGps: (gps: boolean) => void
    ownerNodesFilter: boolean
    toggleOwnerNodesFilter: () => void
    filterNodesByOwner: (ownerId: string, nodes: Node[]) => Node[]
    rangeFilter: boolean
    toggleRangeFilter: () => void
    filterNodesByRange: (position: { latitude: number, longitude: number }, nodes: Node[], range: number) => Node[]
    volume: number
    setVolume: (volume: number) => void
    enemies: Player[]
    getEnemies: () => void
    scanNodes: (position: Coordinates, onSuccess: () => void, onError: () => void) => void
    buyDaemons: (amount: ItemSize, onSuccess: () => void, onError: () => void) => void
    messages: Message[]
    initiateWebSocket: (url: string) => void
    sendMessage: (message: string) => void
    webSocket: WebSocket | null
    onMessage: (event: MessageEvent) => void
    unreadMessages: number
    increaseUnreadMessages: () => void
    resetUnreadMessages: () => void
    activePlayers: string[]
}

const BASE_URL = "https://snekhome.click/api"

export const useStore = create<State>(set => ({
    user: "",
    player: null,
    nodes: [],
    enemies: [],
    isLoading: true,
    isScanning: false,
    gps: false,
    sortDirection: "asc",
    ownerNodesFilter: false,
    rangeFilter: false,
    volume: 0.5,
    webSocket: null,
    messages: [],
    unreadMessages: 0,
    activePlayers: [],

    initializeXsrfToken: () => {
        set({isLoading: true})
        fetch("http://snekhome.click/api/user", {
            method: "GET",
            credentials: "include",
        }).then(response => {
            console.log(response)
            const xsrfToken = response["_bodyBlob"]["_data"]["blobId"]
            console.log("XSRF token: ", xsrfToken)
            AsyncStorage.setItem("xsrfToken", xsrfToken)
            AsyncStorage.getItem("xsrfToken").then(token => console.log("XSRF token from storage: ", token))

        }).catch(error => {
                console.log("Error obtaining XSRF token: ", error)
            })
            .then(() => set({isLoading: false}))
    },

    getPlayer: () => {
        set({isLoading: true})
        axios
            .get(`${BASE_URL}/player`)
            .then(response => response.data)
            .catch(() => set({player: null}))
            .then(data => {
                set({player: data});
            })
            .then(() => set({isLoading: false}));
    },

    getUser: () => {
        set({isLoading: true})
        axios
            .get(`${BASE_URL}/user`)
            .then(response => response.data)
            .then(data => {
                set({user: data});
            })
            .catch(console.error)
            .then(() => set({isLoading: false}));
    },

    getNodes: () => {
        set({isLoading: true})
        axios
            .get(`${BASE_URL}/nodes`)
            .then(response => response.data)
            .then(data => {
                set({nodes: data});
            })
            .catch(console.error)
            .then(() => set({isLoading: false}));
    },

    addNode: (nodeData: NodeData, onSuccess: () => void, onError: () => void) => {
        set({isLoading: true})
        axios
            .post(`${BASE_URL}/nodes`, nodeData)
            .then(response => response.data)
            .then(data => {
                onSuccess()
                set((state) => ({nodes: [...state.nodes, data]}));
            })
            .catch(error => {
                onError()
                console.error(error)
            })
            .then(() => set({isLoading: false}));
    },

    editNode: (nodeId: string, action: ActionType) => {
        set({isLoading: true});
        axios
            .put(`${BASE_URL}/nodes/${nodeId}`, action, {headers: {"Content-Type": "text/plain"}})
            .then((response) => response.data)
            .then((data) => {
                set((state) => ({
                    nodes: state.nodes.map((node) => (node.id === nodeId ? data : node)),
                }));
            })
            .catch(console.error)
            .then(() => {
                useStore.getState().getPlayer();
                set({isLoading: false})
            });
    },

    deleteNode: (nodeId: string, onSuccess: () => void, onError: () => void) => {
        set({isLoading: true});
        axios
            .delete(`${BASE_URL}/nodes/${nodeId}`)
            .catch(error => {
                onError()
                console.error(error)
            })
            .then(() => {
                onSuccess()
                set((state) => ({
                    nodes: state.nodes.filter((node) => node.id !== nodeId),
                }));
            })
            .then(() => set({isLoading: false}));
    },

    login: async (basicAuth: string, onSuccess: () => void, onError: () => void) => {
        set({isLoading: true});
        useStore.getState().initializeXsrfToken()
        const xsrfToken = await AsyncStorage.getItem("xsrfToken")
        if (!xsrfToken) {
            console.error('XSRF token not available');
            return;
        }
        const headers = {
            "X-XSRF-Token": xsrfToken,
            "Authorization": "Basic " + basicAuth
        };
        try {
            const response = await axios.post(`${BASE_URL}/user/login`, {}, { headers });
            console.log('Response:', response.data);
            onSuccess()
        } catch (error) {
            console.error('Error making request:', error);
            onError()
        }
    },

    register: (username: string, email: string, password: string) => {
        set({isLoading: true});
        axios
            .post(`${BASE_URL}/user/register`, {username, email, password})
            .catch(console.error)
            .then(() => set({isLoading: false}));
    },

    logout: (onSuccess: () => void, onError: () => void) => {
        set({isLoading: true});
        axios
            .post(`${BASE_URL}/user/logout`)
            .then(() => {
                set({user: "anonymousUser"});
                set({player: null});
                set({isLoading: false})
                onSuccess();
            })
            .catch((error) => {
                console.error(error);
                set({isLoading: false})
                onError()
            })
    },

    updateLocation: (coordinates: Coordinates) => {
        set({isLoading: true});
        axios
            .put(`${BASE_URL}/player/location`, coordinates)
            .then((response) => response.data)
            .then(data => {
                set({player: data});
            })
            .catch(console.error)
            .then(() => set({isLoading: false}));
    },

    setGps: (gps: boolean) => {
        set({gps: gps});
    },

    toggleSortDirection: () => {
        const direction = useStore.getState().sortDirection;
        if (direction === "asc") {
            set({sortDirection: "desc"});
        } else {
            set({sortDirection: "asc"});
        }
    },

    sortNodesByDistance: (position: { latitude: number, longitude: number }, nodes: Node[]) => {
        const direction = useStore.getState().sortDirection;
        if (direction === "asc") {
            return nodes.sort((a, b) => {
                const distanceA = getDistanceBetweenCoordinates(position, {
                    latitude: a.coordinates.latitude,
                    longitude: a.coordinates.longitude
                });
                const distanceB = getDistanceBetweenCoordinates(position, {
                    latitude: b.coordinates.latitude,
                    longitude: b.coordinates.longitude
                });
                if (direction === "asc") {
                    return distanceA - distanceB;
                } else {
                    return distanceB - distanceA;
                }
            })
        } else {
            return nodes.slice();
        }
    },

    toggleOwnerNodesFilter: () => {
        set((state) => ({ownerNodesFilter: !state.ownerNodesFilter}));
    },

    filterNodesByOwner: (ownerId: string, nodes: Node[]) => {
        const filter = useStore.getState().ownerNodesFilter;
        if (filter) {
            return nodes.filter((node) => node.ownerId === ownerId);
        } else {
            return nodes.slice();
        }
    },

    toggleRangeFilter: () => {
        set((state) => ({rangeFilter: !state.rangeFilter}));
    },

    filterNodesByRange: (position: { latitude: number, longitude: number }, nodes: Node[], range: number) => {
        const filter = useStore.getState().rangeFilter;
        if (filter) {
            return nodes.filter((node) => {
                const distance = getDistanceBetweenCoordinates(position, {
                    latitude: node.coordinates.latitude,
                    longitude: node.coordinates.longitude
                });
                return distance <= range;
            });
        } else {
            return nodes.slice();
        }
    },

    setVolume: (newVolume: number) => {
        set({volume: newVolume});
    },

    getEnemies: () => {
        set({isLoading: true});
        axios
            .get(`${BASE_URL}/player/enemies`)
            .then((response) => response.data)
            .then(data => {
                set({enemies: data});
            })
            .catch(console.error)
            .then(() => set({isLoading: false}));
    },

    scanNodes: (position: Coordinates, onSuccess: () => void, onError: () => void) => {
        set({isScanning: true});
        axios
            .post(`${BASE_URL}/nodes/scan`, position)
            .then(response => response.data)
            .then(response => response.data)
            .then(data => {
                onSuccess()
                if (data !== undefined) {
                    set((state) => ({nodes: [...state.nodes, data]}));
                }
            })
            .catch(error => {
                onError()
                console.error(error)
            })
            .then(() => {
                useStore.getState().getNodes()
                useStore.getState().getPlayer()
                set({isScanning: false})
            });
    },

    buyDaemons: (amount: ItemSize, onSuccess: () => void, onError: () => void) => {
        axios
            .put(`${BASE_URL}/player/store`, amount, {headers: {"Content-Type": "text/plain"}})
            .then(response => response.data)
            .then(data => {
                set({player: data});
                onSuccess()
            })
            .catch(error => {
                onError()
                console.error(error)
            });
    },

    initiateWebSocket: (url: string) => {
        const webSocket = new WebSocket(url);
        webSocket.onmessage = (event) => {
            useStore.getState().onMessage(event);
        }
        set({webSocket: webSocket});
    },

    onMessage: (event: MessageEvent) => {
        let payload = event.data
        if (payload.startsWith("{")) {
            payload = JSON.parse(payload) as Message;
            set((state) => ({messages: [...state.messages, payload]}));
            useStore.getState().increaseUnreadMessages();
        } else {
            payload = JSON.parse(payload) as string;
            set(() => ({activePlayers: payload}));
        }
    },

    sendMessage: (message: string) => {
        const webSocket = useStore.getState().webSocket;
        if (webSocket) {
            webSocket.send(message);
        }
    },

    increaseUnreadMessages: () => {
        set((state) => ({unreadMessages: state.unreadMessages + 1}));
    },

    resetUnreadMessages: () => {
        set({unreadMessages: 0});
    },

}));

async function extractXsrfTokenFromResponse(response) {
    const setCookieHeader = await response.headers['set-cookie'];
    console.log("setCookieHeader: ", typeof setCookieHeader)
    if (setCookieHeader) {
        const xsrfTokenCookie = setCookieHeader.find(cookie => cookie.includes('XSRF-TOKEN'));
        if (xsrfTokenCookie) {
            const xsrfToken = xsrfTokenCookie.split(';')[0].split('=')[1];
            return xsrfToken;
        }
    }
    return null;
}
