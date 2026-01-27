import { useState, useRef, useId, useLayoutEffect } from 'react';
import './GlassSurface.css';

// 1. Global Singleton for browser support check - run once
let isSVGFilterSupported = null;
const checkSVGSupport = (filterId) => {
    if (isSVGFilterSupported !== null) return isSVGFilterSupported;
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;

    // Check for Chromium based browsers as they have the best support for SVG filters in backdrop-filter
    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);

    if (isWebkit || isFirefox) {
        isSVGFilterSupported = false;
        return false;
    }

    const div = document.createElement('div');
    div.style.backdropFilter = `url(#${filterId})`;
    isSVGFilterSupported = div.style.backdropFilter !== '';
    return isSVGFilterSupported;
};

const GlassSurface = ({
    children,
    width = 200,
    height = 80,
    borderRadius = 20,
    borderWidth = 0.07,
    brightness = 50,
    opacity = 0.93,
    blur = 11,
    displace = 0,
    backgroundOpacity = 0,
    saturation = 1,
    distortionScale = -180,
    redOffset = 0,
    greenOffset = 10,
    blueOffset = 20,
    xChannel = 'R',
    yChannel = 'G',
    mixBlendMode = 'difference',
    className = '',
    style = {}
}) => {
    // 2. Ensure IDs are TRULY unique even during rapid navigation/cross-fades
    const uniqueId = useId().replace(/:/g, '-') + '-' + Math.random().toString(36).substring(2, 9);
    const filterId = `glass-filter-${uniqueId}`;
    const redGradId = `red-grad-${uniqueId}`;
    const blueGradId = `blue-grad-${uniqueId}`;

    const [svgSupported] = useState(() => checkSVGSupport(filterId));

    const containerRef = useRef(null);
    const feImageRef = useRef(null);
    const redChannelRef = useRef(null);
    const greenChannelRef = useRef(null);
    const blueChannelRef = useRef(null);
    const gaussianBlurRef = useRef(null);

    const generateDisplacementMap = () => {
        if (!containerRef.current) return '';

        const rect = containerRef.current.getBoundingClientRect();

        // 3. Fallback logic: if dimensions are 0 (layout not ready), return empty and we'll retry via RAF
        if (rect.width === 0 || rect.height === 0) return '';

        const actualWidth = rect.width;
        const actualHeight = rect.height;
        const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

        const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

        return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
    };

    const updateDisplacementMap = () => {
        if (!feImageRef.current || !containerRef.current) return;

        const map = generateDisplacementMap();
        if (map) {
            feImageRef.current.setAttribute('href', map);
        } else {
            // Layout likely not ready, retry in next frame
            requestAnimationFrame(updateDisplacementMap);
        }
    };

    useLayoutEffect(() => {
        // Initial mount: give layout a frame to settle
        const timer = requestAnimationFrame(updateDisplacementMap);

        [
            { ref: redChannelRef, offset: redOffset },
            { ref: greenChannelRef, offset: greenOffset },
            { ref: blueChannelRef, offset: blueOffset }
        ].forEach(({ ref, offset }) => {
            if (ref.current) {
                ref.current.setAttribute('scale', (distortionScale + offset).toString());
                ref.current.setAttribute('xChannelSelector', xChannel);
                ref.current.setAttribute('yChannelSelector', yChannel);
            }
        });

        if (gaussianBlurRef.current) {
            gaussianBlurRef.current.setAttribute('stdDeviation', displace.toString());
        }

        return () => cancelAnimationFrame(timer);
    }, [
        width,
        height,
        borderRadius,
        borderWidth,
        brightness,
        opacity,
        blur,
        displace,
        distortionScale,
        redOffset,
        greenOffset,
        blueOffset,
        xChannel,
        yChannel,
        mixBlendMode
    ]);

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            updateDisplacementMap();
        });

        resizeObserver.observe(containerRef.current);

        // Ensure we catch the initial layout
        const timer = requestAnimationFrame(updateDisplacementMap);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(timer);
        };
    }, []);

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
        <div
            ref={containerRef}
            className={`glass-surface ${svgSupported ? 'glass-surface--svg' : 'glass-surface--fallback'} ${className}`}
            style={containerStyle}
        >
            <svg className="glass-surface__filter" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
                        <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

                        <feDisplacementMap ref={redChannelRef} in="SourceGraphic" in2="map" id="redchannel" result="dispRed" />
                        <feColorMatrix
                            in="dispRed"
                            type="matrix"
                            values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
                            result="red"
                        />

                        <feDisplacementMap
                            ref={greenChannelRef}
                            in="SourceGraphic"
                            in2="map"
                            id="greenchannel"
                            result="dispGreen"
                        />
                        <feColorMatrix
                            in="dispGreen"
                            type="matrix"
                            values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
                            result="green"
                        />

                        <feDisplacementMap ref={blueChannelRef} in="SourceGraphic" in2="map" id="bluechannel" result="dispBlue" />
                        <feColorMatrix
                            in="dispBlue"
                            type="matrix"
                            values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
                            result="blue"
                        />

                        <feBlend in="red" in2="green" mode="screen" result="rg" />
                        <feBlend in="rg" in2="blue" mode="screen" result="output" />
                        <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
                    </filter>
                </defs>
            </svg>

            <div className="glass-surface__content">{children}</div>
        </div>
    );
};

export default GlassSurface;
