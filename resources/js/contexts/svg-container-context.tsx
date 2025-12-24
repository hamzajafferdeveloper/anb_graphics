import React, { createContext, useContext, useRef } from 'react';

type SvgContainerContextType = {
    svgContainerRef: React.RefObject<HTMLDivElement | null>;
};

const SvgContainerContext = createContext<SvgContainerContextType | null>(null);

export const SvgContainerProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const svgContainerRef = useRef<HTMLDivElement | null>(null);

    return (
        <SvgContainerContext.Provider value={{ svgContainerRef }}>
            {children}
        </SvgContainerContext.Provider>
    );
};

export const useSvgContainer = (): SvgContainerContextType => {
    const context = useContext(SvgContainerContext);
    if (!context) {
        throw new Error(
            'useSvgContainer must be used within a SvgContainerProvider',
        );
    }
    return context;
};
