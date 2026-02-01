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
    distortionScale = -80, // Reduced from -180 to prevent "flipping" on small cards
    className = '',
    style = {}
}) => {
    const uniqueId = useId().replace(/:/g, '-');
    const filterId = `glass-opt-filter-${uniqueId}`;
    const [svgSupported] = useState(checkSupport);

    // Static Displacement Map - Opaque neutral center prevents mirroring
    const displacementMap = `data:image/svg+xml,${encodeURIComponent(`
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="g-red" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="black"/>
                    <stop offset="15%" stop-color="rgb(128,0,128)"/>
                    <stop offset="85%" stop-color="rgb(128,0,128)"/>
                    <stop offset="100%" stop-color="red"/>
                </linearGradient>
                <linearGradient id="g-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="black"/>
                    <stop offset="15%" stop-color="rgb(128,0,128)"/>
                    <stop offset="85%" stop-color="rgb(128,0,128)"/>
                    <stop offset="100%" stop-color="blue"/>
                </linearGradient>
            </defs>
            {/* Base layer displacement - zero at 128 */}
            <rect width="100" height="100" fill="rgb(128,0,128)"></rect>
            <rect width="100" height="100" fill="url(#g-red)" style="mix-blend-mode: screen" />
            <rect width="100" height="100" fill="url(#g-blue)" style="mix-blend-mode: screen" />
            
            {/* The Solid Center - MUST BE OPAQUE to stop mirroring */}
            <rect x="15" y="15" width="70" height="70" rx="10" fill="rgb(128,0,128)" style="filter:blur(4px)" />
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
                <filter id={filterId} colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
                    <feImage href={displacementMap} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

                    {/* Sequential displacement mapping with centered neutral point */}
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
