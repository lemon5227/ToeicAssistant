import React, { useRef, useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  Animated, 
  TouchableOpacity, 
  StatusBar, 
  SafeAreaView,
  ImageBackground,
  Platform,
  Easing
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BookOpen, Headphones, Scroll, PenTool } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// --- 背景山峦组件 (SVG) ---
const Mountains = () => (
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

// --- 卡片组件 ---
const Card = ({ title, subTitle, icon: Icon, desc, type, onPress }) => {
  const [active, setActive] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // 动画值
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const inkScale = useRef(new Animated.Value(0)).current;
  const inkOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  
  // 听力动画
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  
  // 阅读动画
  const curtainOpen = useRef(new Animated.Value(0)).current;
  
  // 模考动画
  const stampScale = useRef(new Animated.Value(2)).current;
  const stampOpacity = useRef(new Animated.Value(0)).current;

  // 触发按压动画
  const handlePressIn = () => {
    if (isNavigating) return;
    setActive(true);
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();

    // 1. 词汇 - 墨韵 (局部扩散 - 更快更猛)
    if (type === 'vocab') {
      inkScale.setValue(0);
      inkOpacity.setValue(0.2);
      textOpacity.setValue(0);
      
      Animated.parallel([
        Animated.timing(inkScale, { 
          toValue: 1.2, 
          duration: 400, 
          easing: Easing.out(Easing.cubic), // 非线性：先快后慢
          useNativeDriver: true 
        }),
        Animated.timing(inkOpacity, { 
          toValue: 1, 
          duration: 300, 
          useNativeDriver: true 
        }),
        Animated.sequence([
            Animated.delay(50),
            Animated.timing(textOpacity, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true
            })
        ])
      ]).start();
    }

    // 2. 听力 - 涟漪 (循环)
    if (type === 'listening') {
      const createRipple = (anim: Animated.Value, delay: number) => {
        anim.setValue(0);
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          ])
        ).start();
      };
      createRipple(ripple1, 0);
      createRipple(ripple2, 1000);
    }

    // 3. 阅读 - 卷轴展开 (更优雅的合拢)
    if (type === 'reading') {
      Animated.timing(curtainOpen, { 
          toValue: 1, 
          duration: 500, 
          easing: Easing.out(Easing.cubic), 
          useNativeDriver: true 
      }).start();
    }

    // 4. 模考 - 金榜印章
    if (type === 'mock') {
      stampScale.setValue(2);
      stampOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(stampScale, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(stampOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (isNavigating) return; // 如果正在跳转，不复位动画
    
    setActive(false);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    
    // 复位动画
    if (type === 'vocab') {
      Animated.parallel([
        Animated.timing(inkOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(() => inkScale.setValue(0));
    }
    if (type === 'listening') {
      ripple1.stopAnimation();
      ripple2.stopAnimation();
    }
    if (type === 'reading') {
      Animated.timing(curtainOpen, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }
    if (type === 'mock') {
      Animated.timing(stampOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  };

  const handlePress = () => {
    // 移除之前的延迟逻辑，直接调用外部传入的 onPress
    // 动画由外部 InkTransition 控制
    onPress && onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.cardContainer]}
    >

      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        
        {/* --- 特效层 --- */}
        <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
          
          {/* 1. 词汇: 墨水扩散 */}
          {type === 'vocab' && (
            <>
                <Animated.View style={[
                styles.inkSpot, 
                { 
                    transform: [{ scale: inkScale }],
                    opacity: inkOpacity,
                    backgroundColor: '#000',
                }
                ]} />
                <Animated.View style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    opacity: textOpacity,
                }}>
                    <Text style={{ fontSize: 60, fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'serif', fontWeight: 'bold', color: '#000' }}>墨</Text>
                </Animated.View>
            </>
          )}

          {/* 2. 听力: 涟漪 */}
          {type === 'listening' && (
            <View style={styles.centeredContent}>
              {[ripple1, ripple2].map((r, i) => (
                <Animated.View key={i} style={[
                  styles.ripple,
                  {
                    transform: [{ scale: r.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.5] }) }],
                    opacity: r.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] })
                  }
                ]} />
              ))}
            </View>
          )}

          {/* 3. 阅读: 卷轴展开 */}
          {type === 'reading' && (
            <>
              {/* 左卷轴 */}
              <Animated.View style={[
                styles.curtain, 
                { 
                    left: 0, 
                    backgroundColor: '#f5f5dc',
                    borderRightWidth: 0,
                    transform: [{ translateX: curtainOpen.interpolate({ inputRange: [0, 1], outputRange: [-width/2, 0] }) }] 
                } 
              ]}>
                  <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, backgroundColor: '#5d4037', borderLeftWidth: 1, borderColor: '#3e2723' }} />
                  <ImageBackground source={{ uri: 'https://www.transparenttextures.com/patterns/wood-pattern.png' }} style={{flex:1, opacity: 0.4}} />
              </Animated.View>

              {/* 右卷轴 */}
              <Animated.View style={[
                styles.curtain, 
                { 
                    right: 0, 
                    backgroundColor: '#f5f5dc',
                    borderLeftWidth: 0,
                    transform: [{ translateX: curtainOpen.interpolate({ inputRange: [0, 1], outputRange: [width/2, 0] }) }] 
                } 
              ]}>
                  <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, backgroundColor: '#5d4037', borderRightWidth: 1, borderColor: '#3e2723' }} />
                  <ImageBackground source={{ uri: 'https://www.transparenttextures.com/patterns/wood-pattern.png' }} style={{flex:1, opacity: 0.4}} />
              </Animated.View>
            </>
          )}

          {/* 4. 模考: 印章与金光 */}
          {type === 'mock' && (
            <View style={styles.centeredContent}>
               <Animated.View style={{
                 transform: [{ scale: stampScale }, { rotate: '-15deg' }],
                 opacity: stampOpacity,
                 borderWidth: 4,
                 borderColor: '#8b0000',
                 borderRadius: 8,
                 padding: 10,
               }}>
                  <Text style={{ color: '#8b0000', fontSize: 32, fontWeight: 'bold' }}>通过</Text>
               </Animated.View>
            </View>
          )}
          
        </View>

        {/* --- 内容层 --- */}
        <View style={styles.cardContent}>
          <Icon 
            size={32} 
            color={active && type === 'vocab' ? '#f2e6d8' : '#2c2c2c'} 
            style={styles.icon}
          />
          <Text style={[
            styles.cardTitle, 
            active && type === 'vocab' && { color: '#f2e6d8' }
          ]}>{title}</Text>
          <Text style={[styles.cardSubTitle, active && type === 'vocab' && { color: '#ddd' }]}>{subTitle}</Text>
          <View style={[styles.divider, active && type === 'vocab' && { backgroundColor: '#f2e6d8' }]} />
          <Text style={[styles.cardDesc, active && type === 'vocab' && { color: '#ccc' }]}>{desc}</Text>
        </View>
        
      </Animated.View>
    </TouchableOpacity>
  );
};

// --- 全屏转场组件 (已禁用) ---
const InkTransition = ({ visible, onAnimationComplete }: { visible: boolean; onAnimationComplete: () => void }) => {
  // 暂时禁用全屏转场，直接回调
  useEffect(() => {
    if (visible && onAnimationComplete) {
        onAnimationComplete();
    }
  }, [visible]);

  return null;
};

// --- 主页面 ---
export default function App() {
  const router = useRouter();
  const [transitionVisible, setTransitionVisible] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  const handleCardPress = (route: string) => {
      setTargetRoute(route);
      setTransitionVisible(true);
  };

  const onTransitionComplete = () => {
      if (targetRoute) {
          router.push(targetRoute);
          // 稍微延迟一点重置，防止返回时看到黑屏
          setTimeout(() => {
              setTransitionVisible(false);
              setTargetRoute(null);
          }, 500);
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <InkTransition visible={transitionVisible} onAnimationComplete={onTransitionComplete} />
      
      {/* 宣纸噪点背景 (模拟) */}
      <ImageBackground 
        source={{ uri: 'https://www.transparenttextures.com/patterns/cream-paper.png' }}
        style={StyleSheet.absoluteFill}
        resizeMode="repeat"
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(242, 230, 216, 0.9)' }}>
          <Mountains />

          {/* 装饰印章 */}
          <View style={styles.stampContainer}>
             <View style={styles.stampBox}>
                <Text style={styles.stampText}>及第</Text>
             </View>
          </View>

          {/* 头部 */}
          <View style={styles.header}>
            <Text style={styles.mainTitle}>墨韵 · 托业</Text>
            <Text style={styles.subTitle}>TOEIC MASTER</Text>
            <View style={styles.titleBar} />
          </View>

          {/* 列表 */}
          <View style={styles.grid}>
             <View style={styles.row}>
                <Card 
                  type="vocab"
                  title="词汇研习" 
                  subTitle="Vocabulary" 
                  icon={PenTool} 
                  desc="日积跬步"
                  onPress={() => handleCardPress('/vocabulary')}
                />
                <Card 
                  type="listening"
                  title="听音辨律" 
                  subTitle="Listening" 
                  icon={Headphones} 
                  desc="耳得之声"
                  onPress={() => handleCardPress('/listening')}
                />
             </View>
             <View style={styles.row}>
                <Card 
                  type="reading"
                  title="经史阅览" 
                  subTitle="Reading" 
                  icon={BookOpen} 
                  desc="读书百遍"
                  onPress={() => handleCardPress('/reading')}
                />
                <Card 
                  type="mock"
                  title="金榜夺魁" 
                  subTitle="Mock Test" 
                  icon={Scroll} 
                  desc="一朝试锋"
                  onPress={() => handleCardPress('/mocktest')}
                />
             </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mountainsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    opacity: 0.2,
  },
  stampContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 30,
    transform: [{ rotate: '12deg' }],
    opacity: 0.8,
  },
  stampBox: {
    width: 50,
    height: 50,
    borderWidth: 3,
    borderColor: '#8b0000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  stampText: {
    color: '#8b0000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'PingFang SC' : 'serif', // 安卓可能需要自定义字体
  },
  subTitle: {
    color: '#5c5c5c',
    fontSize: 14,
    letterSpacing: 4,
    marginTop: 10,
    fontWeight: '300',
  },
  titleBar: {
    width: 60,
    height: 4,
    backgroundColor: '#8b0000',
    borderRadius: 2,
    marginTop: 20,
  },
  grid: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardContainer: {
    width: (width - 60) / 2,
    height: 180,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  icon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c2c2c',
    marginBottom: 4,
  },
  cardSubTitle: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  divider: {
    width: 20,
    height: 1,
    backgroundColor: '#8b0000',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  // --- 特效样式 ---
  inkSpot: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'absolute',
    top: -10,
    left: -10,
  },
  centeredContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#4a6fa5',
  },
  curtain: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    overflow: 'hidden',
  }
});
