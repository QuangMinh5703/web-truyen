
import React from 'react';

interface EyeIconProps {
    width?: number | string;
    height?: number | string;
    className?: string;
}

const EyeIcon = ({ width = 20, height = 20, className = "" }: EyeIconProps) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="main-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="var(--main-color-start)" />
                    <stop offset="100%" stopColor="var(--main-color-end)" />
                </linearGradient>
            </defs>
            <path
                d="M52 290C52 177.336 143.336 86 256 86C368.664 86 460 177.336 460 290"
                stroke="url(#main-gradient)"
                strokeWidth="42"
                strokeLinecap="round"
            />
            <path
                d="M256 186C210.156 186 173 223.156 173 269C173 314.844 210.156 352 256 352C301.844 352 339 314.844 339 269C339 253.5 334.5 239.5 327 227.5C321.5 218.5 315.5 212.5 307.5 204C293 189.5 277.5 186 256 186Z"
                stroke="url(#main-gradient)"
                strokeWidth="40"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
};

export default EyeIcon;
