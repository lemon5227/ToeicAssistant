import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
    return (
        <>
            <StatusBar style="dark" />
            <Stack 
                screenOptions={{ 
                    headerShown: false,
                    contentStyle: { backgroundColor: '#F7F5F0' }, // bg-paper
                    gestureEnabled: true,
                }} 
            />
        </>
    );
}
