import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ChartMultilineIconProps {
    width?: number;
    height?: number;
    color?: string;
}

export default function ChartMultilineIcon({
    width = 18,
    height = 18,
    color = 'black',
}: ChartMultilineIconProps) {
    return (
        <Svg width={width} height={height} viewBox="0 0 18 18" fill="none">
            <Path
                d="M16.5 5.19L15.4425 4.125L13.305 6.54C11.76 4.8 9.6225 3.75 7.2075 3.75C5.04 3.75 3.0525 4.62 1.5 6L2.565 7.065C3.84 5.9475 5.4525 5.25 7.2075 5.25C9.2625 5.25 11.025 6.195 12.285 7.68L10.125 10.125L7.125 7.125L1.5 12.75L2.625 13.875L7.125 9.375L10.125 12.375L13.1625 8.9475C13.725 9.96 14.1 11.1225 14.25 12.375H15.75C15.585 10.635 15.0375 9.0675 14.22 7.755L16.5 5.19Z"
                fill={color}
            />
        </Svg>
    );
}
/*
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="" fill="black"/>
</svg>
*/
