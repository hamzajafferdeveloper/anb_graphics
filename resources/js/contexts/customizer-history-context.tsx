import { createContext, useContext, useCallback, useRef, useState, ReactNode } from 'react';

function shallowEqual(objA: any, objB: any) {
    if (Object.is(objA, objB)) return true;
    if (
        typeof objA !== 'object' ||
        objA === null ||
        typeof objB !== 'object' ||
        objB === null
    )
        return false;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    for (let key of keysA) {
        if (
            !Object.prototype.hasOwnProperty.call(objB, key) ||
            !Object.is(objA[key], objB[key])
        )
            return false;
    }
    return true;
}

type HistoryState<T> = {
    present: T;
    setLive: (updater: T | ((prev: T) => T)) => void;
    setAndCommit: (updater: T | ((prev: T) => T)) => void;
    commit: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    resetHistory: (state: T) => void;
};

const CustomizerHistoryContext = createContext<HistoryState<any> | undefined>(undefined);

export function useCustomizerHistory<T>(): HistoryState<T> {
    const context = useContext(CustomizerHistoryContext);
    if (context === undefined) {
        throw new Error('useCustomizerHistory must be used within a CustomizerHistoryProvider');
    }
    return context as HistoryState<T>;
}

export function CustomizerHistoryProvider<T>({ 
    children, 
    initialValue 
}: { 
    children: ReactNode; 
    initialValue: T 
}) {
    const [present, setPresent] = useState<T>(initialValue);
    const undoStack = useRef<T[]>([]);
    const redoStack = useRef<T[]>([]);
    const lastCommitted = useRef<T>(initialValue);

    const setLive = useCallback((updater: T | ((prev: T) => T)) => {
        setPresent(prev => 
            typeof updater === 'function'
                ? (updater as (p: T) => T)(prev)
                : updater
        );
    }, []);

    const commit = useCallback(() => {
        const prev = lastCommitted.current;
        const now = present;
        if (shallowEqual(prev, now)) return;
        undoStack.current.push(prev);
        redoStack.current = [];
        lastCommitted.current = now;
    }, [present]);

    const setAndCommit = useCallback((updater: T | ((prev: T) => T)) => {
        setPresent(prev => {
            const next =
                typeof updater === 'function'
                    ? (updater as (p: T) => T)(prev)
                    : updater;
            if (!shallowEqual(lastCommitted.current, next)) {
                undoStack.current.push(lastCommitted.current);
                redoStack.current = [];
                lastCommitted.current = next;
            }
            return next;
        });
    }, []);

    const undo = useCallback(() => {
        setPresent(curr => {
            if (undoStack.current.length === 0) return curr;
            const prev = undoStack.current.pop()!;
            redoStack.current.push(curr);
            lastCommitted.current = prev;
            return prev;
        });
    }, []);

    const redo = useCallback(() => {
        setPresent(curr => {
            if (redoStack.current.length === 0) return curr;
            const next = redoStack.current.pop()!;
            undoStack.current.push(curr);
            lastCommitted.current = next;
            return next;
        });
    }, []);

    const canUndo = undoStack.current.length > 0;
    const canRedo = redoStack.current.length > 0;

    const resetHistory = useCallback((state: T) => {
        undoStack.current = [];
        redoStack.current = [];
        lastCommitted.current = state;
        setPresent(state);
    }, []);

    return (
        <CustomizerHistoryContext.Provider
            value={{
                present,
                setLive,
                setAndCommit,
                commit,
                undo,
                redo,
                canUndo,
                canRedo,
                resetHistory,
            }}
        >
            {children}
        </CustomizerHistoryContext.Provider>
    );
}
