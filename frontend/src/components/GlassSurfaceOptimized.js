import React, { useId, useState } from 'react';
import './GlassSurfaceOptimized.css';

// Check for backdrop-filter support once
let isSupported = null;
const checkSupport = () => {
    if (isSupported !== null) return isSupported;
    if (typeof window === 'undefined') return false;
    const el = document.createElement('div');
    isSupported = el.style.backdropFilter !== undefined || el.style.webkitBackdropFilter !== undefined;
    return isSupported;
};

const GlassSurfaceOptimized = ({
    children,
    width = 200,
    height = 80,
    borderRadius = 20,
    brightness = 50,
    opacity = 0.93,
    blur = 11,
    saturation = 1,
    backgroundOpacity = 0,
    distortionScale = -180,
    className = '',
    style = {}
}) => {
    const uniqueId = useId().replace(/:/g, '-');
    const filterId = `glass-opt-filter-${uniqueId}`;
    const [svgSupported] = useState(checkSupport);

    // Static Displacement Map - 1:1 REPLICA OF ORIGINAL
    const displacementMap = `data:image/svg+xml,${encodeURIComponent(`
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="g-red" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stop-color="#0000"/>
                    <stop offset="100%" stop-color="red"/>
                </linearGradient>
                <linearGradient id="g-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#0000"/>
                    <stop offset="100%" stop-color="blue"/>
                </linearGradient>
            </defs>
            <rect width="100" height="100" fill="black"></rect>
            <rect width="100" height="100" fill="url(#g-red)" />
            <rect width="100" height="100" fill="url(#g-blue)" style="mix-blend-mode: difference" />
            <rect x="5" y="5" width="90" height="90" rx="5" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(5px)" />
        </svg>
    `)}`;

    const containerStyle = {
        ...style,
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: `${borderRadius}px`,
        '--glass-frost': backgroundOpacity,
        '--glass-saturation': saturation,
        '--filter-id': `url(#${filterId})`
    };

    return (
        <>
            <svg className="glass-surface-opt__filter-svg" xmlns="http://www.w3.org/2000/svg">
                <filter id={filterId} colorInterpolationFilters="sRGB" x="-10%" y="-10%" width="120%" height="120%">
                    <feImage href={displacementMap} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

                    <feDisplacementMap in="SourceGraphic" in2="map" scale={distortionScale} xChannelSelector="R" yChannelSelector="B" result="dispRed" />
                    <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />

                    <feDisplacementMap in="SourceGraphic" in2="map" scale={distortionScale + 10} xChannelSelector="R" yChannelSelector="B" result="dispGreen" />
                    <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />

                    <feDisplacementMap in="SourceGraphic" in2="map" scale={distortionScale + 20} xChannelSelector="R" yChannelSelector="B" result="dispBlue" />
                    <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />

                    <feBlend in="red" in2="green" mode="screen" result="rg" />
                    <feBlend in="rg" in2="blue" mode="screen" result="output" />
                    <feGaussianBlur in="output" stdDeviation="0.7" />
                </filter>
            </svg>

            <div
                className={`glass-surface-opt ${svgSupported ? 'glass-surface-opt--svg' : 'glass-surface-opt--fallback'} ${className}`}
                style={containerStyle}
            >
                <div className="glass-surface-opt__content">
                    {children}
                </div>
            </div>
        </>
    );
};

export default GlassSurfaceOptimized;
