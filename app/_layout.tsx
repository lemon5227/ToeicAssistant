import "../global.css";
import { Slot } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
    return (
        <View className="flex-1 bg-paper">
            <StatusBar style="dark" />
            <Slot />
        </View>
    );
}
