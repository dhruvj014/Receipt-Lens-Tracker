import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';

interface ProgressBarProps {
    progress: number; // 0 to 1
    color?: string;
    height?: number;
    label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    color = '#2e7d32', // Green primary color
    height = 8,
    label
}) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    // Animate whenever progress prop changes
    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: Math.min(Math.max(progress, 0), 1), // Clamp between 0 and 1
            duration: 500,
            useNativeDriver: false, // width property is not supported by native driver
        }).start();
    }, [progress]);

    const widthInterpolation = animatedWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.track, { height }]}>
                <Animated.View
                    style={[
                        styles.bar,
                        {
                            backgroundColor: color,
                            width: widthInterpolation,
                        },
                    ]}
                />
            </View>
            <Text style={styles.percentage}>
                {Math.round(progress * 100)}%
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 12,
    },
    label: {
        marginBottom: 6,
        fontSize: 14,
        color: '#444',
        fontWeight: '600',
    },
    track: {
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 4,
    },
    percentage: {
        position: 'absolute',
        right: 0,
        top: 0,
        fontSize: 12,
        color: '#888',
    }
});
