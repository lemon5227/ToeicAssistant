import React, { useRef, useEffect } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    ViewProps,
    TouchableOpacityProps,
    TextProps,
    StyleSheet,
    ImageBackground,
    Dimensions,
    Animated,
    Platform
} from 'react-native';
import { styled } from 'nativewind';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

// --- 背景山峦组件 (SVG) ---
export const Mountains = () => (
    <View style={styles.mountainsContainer}>
        <Svg height="100%" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <Path
                fill="#2c2c2c"
                fillOpacity="1"
                d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
            <Path
                fill="#555"
                fillOpacity="0.5"
                d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
        </Svg>
    </View>
);

// --- 国风背景容器 ---
interface GuofengBackgroundProps {
    children: React.ReactNode;
    showMountains?: boolean;
}

export const GuofengBackground: React.FC<GuofengBackgroundProps> = ({ children, showMountains = true }) => {
    return (
        <ImageBackground
            source={{ uri: 'https://www.transparenttextures.com/patterns/cream-paper.png' }}
            style={StyleSheet.absoluteFill}
            resizeMode="repeat"
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(242, 230, 216, 0.95)' }}>
                {showMountains && <Mountains />}
                {children}
            </View>
        </ImageBackground>
    );
};

// --- 返回按钮 ---
export const GuofengBackButton = () => {
    const router = useRouter();
    return (
        <TouchableOpacity
            onPress={() => router.back()}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 8,
                marginLeft: -8,
                marginBottom: 10
            }}
        >
            <ChevronLeft color="#2c2c2c" size={26} />
            <Text style={{
                fontSize: 16,
                color: '#2c2c2c',
                fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'serif',
                marginLeft: 4
            }}>返回</Text>
        </TouchableOpacity>
    );
};

// --- 列表卡片组件 ---
interface GuofengListCardProps extends TouchableOpacityProps {
    title: string;
    subtitle?: string;
    index?: number;
    onPress?: () => void;
}

export const GuofengListCard: React.FC<GuofengListCardProps> = ({ title, subtitle, index = 0, onPress, style, ...props }) => {
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
                delay: index * 100,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
                delay: index * 100,
            })
        ]).start();
    }, []);

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                style={[styles.listCard, style]}
                {...props}
            >
                <View style={styles.listCardContent}>
                    <Text style={styles.listCardTitle}>{title}</Text>
                    {subtitle && <Text style={styles.listCardSubtitle}>{subtitle}</Text>}
                </View>
                <View style={styles.listCardDecoration} />
            </TouchableOpacity>
        </Animated.View>
    );
};

// --- 标题组件 ---
export const SealText: React.FC<TextProps & { type?: 'title' | 'info' | 'success' | 'error' }> = ({ children, type = 'title', style, ...props }) => {
    return (
        <Text
            style={[
                type === 'title' && styles.sealTitle,
                type === 'info' && styles.sealInfo,
                type === 'success' && styles.sealSuccess,
                type === 'error' && styles.sealError,
                style
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

interface PaperCardProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
}

export const PaperCard: React.FC<PaperCardProps> = ({ children, className, ...props }) => {
    return (
        <StyledView
            className={`bg-white/80 border border-stone-300 rounded-lg shadow-sm p-4 ${className}`}
            {...props}
        >
            {children}
        </StyledView>
    );
};

const styles = StyleSheet.create({
    mountainsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        opacity: 0.15,
        zIndex: -1,
    },
    listCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#dcdcdc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    listCardContent: {
        flex: 1,
    },
    listCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c2c2c',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'serif',
    },
    listCardSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    listCardDecoration: {
        width: 4,
        height: 24,
        backgroundColor: '#8b0000',
        borderRadius: 2,
        marginLeft: 16,
        opacity: 0.6,
    },
    sealTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginVertical: 20,
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'serif',
    },
    sealInfo: {
        fontSize: 12,
        color: '#8b0000',
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: '#8b0000',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    sealSuccess: {
        fontSize: 16,
        color: '#2e8b57',
        fontWeight: 'bold',
        borderWidth: 2,
        borderColor: '#2e8b57',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        transform: [{ rotate: '-10deg' }]
    },
    sealError: {
        fontSize: 16,
        color: '#8b0000',
        fontWeight: 'bold',
        borderWidth: 2,
        borderColor: '#8b0000',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        transform: [{ rotate: '-10deg' }]
    }
});


interface InkButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    variant?: 'primary' | 'outline' | 'ghost' | 'correct' | 'wrong';
    textClassName?: string;
}

export const InkButton: React.FC<InkButtonProps> = ({ children, variant = 'primary', className, textClassName, ...props }) => {
    let containerClass = "py-3 px-6 rounded-full items-center justify-center";
    let textClass = "font-serif text-lg";

    if (variant === 'primary') {
        containerClass += " bg-ink";
        textClass += " text-paper font-bold";
    } else if (variant === 'outline') {
        containerClass += " border-2 border-ink bg-transparent";
        textClass += " text-ink font-bold";
    } else if (variant === 'correct') {
        containerClass += " bg-green-600 border-2 border-green-600";
        textClass += " text-white font-bold";
    } else if (variant === 'wrong') {
        containerClass += " bg-red-100 border-2 border-red-500";
        textClass += " text-red-800 font-bold";
    } else {
        containerClass += " bg-transparent";
        textClass += " text-ink underline";
    }

    return (
        <StyledTouchableOpacity className={`${containerClass} ${className}`} {...props}>
            {typeof children === 'string' ? (
                <StyledText className={`${textClass} ${textClassName}`}>{children}</StyledText>
            ) : (
                children
            )}
        </StyledTouchableOpacity>
    );
};

