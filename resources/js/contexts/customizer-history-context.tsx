import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react';

function deepEqual(a: any, b: any): boolean {
    // Handle primitive types and null/undefined
    if (a === b) return true;
    if (
        a === null ||
        b === null ||
        typeof a !== 'object' ||
        typeof b !== 'object'
    ) {
        return false;
    }
    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }
    // Handle objects
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (
            !Object.prototype.hasOwnProperty.call(b, key) ||
            !deepEqual(a[key], b[key])
        ) {
            return false;
        }
    }

    return true;
}

function shallowEqual(objA: any, objB: any) {
    if (Object.is(objA, objB)) return true;
    if (
        typeof objA !== 'object' ||
        objA === null ||
        typeof objB !== 'object' ||
        objB === null
    )
        return deepEqual(objA.parts, objB.parts);
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

const CustomizerHistoryContext = createContext<HistoryState<any> | undefined>(
    undefined,
);

export function useCustomizerHistory<T>(): HistoryState<T> {
    const context = useContext(CustomizerHistoryContext);
    if (context === undefined) {
        throw new Error(
            'useCustomizerHistory must be used within a CustomizerHistoryProvider',
        );
    }
    return context as HistoryState<T>;
}

export function CustomizerHistoryProvider<T>({
    children,
    initialValue,
}: {
    children: ReactNode;
    initialValue: T;
}) {
    const [present, setPresent] = useState<T>(initialValue);
    const undoStack = useRef<T[]>([]);
    const redoStack = useRef<T[]>([]);
    const lastCommitted = useRef<T>(initialValue);

    const setLive = useCallback((updater: T | ((prev: T) => T)) => {
        setPresent((prev) =>
            typeof updater === 'function'
                ? (updater as (p: T) => T)(prev)
                : updater,
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
        setPresent((prev) => {
            const next =
                typeof updater === 'function'
                    ? (updater as (p: T) => T)(prev)
                    : updater;

            // Only push to undo stack if there's an actual change
            if (!shallowEqual(prev, next)) {
                undoStack.current.push(JSON.parse(JSON.stringify(prev))); // Deep clone
                redoStack.current = []; // Clear redo stack on new action
                lastCommitted.current = next;
            }
            return next;
        });
    }, []);

    const undo = useCallback(() => {
        if (undoStack.current.length === 0) return;

        const previousState = undoStack.current.pop()!;
        const currentState = present;

        // Only update if there's a change
        if (!shallowEqual(previousState, currentState)) {
            redoStack.current.push(JSON.parse(JSON.stringify(currentState))); // Deep clone
            setPresent(previousState);
            lastCommitted.current = previousState;
        }
    }, [present]);
    const redo = useCallback(() => {
        if (redoStack.current.length === 0) return;

        const nextState = redoStack.current.pop()!;
        const currentState = present;

        // Only update if there's a change
        if (!shallowEqual(nextState, currentState)) {
            undoStack.current.push(JSON.parse(JSON.stringify(currentState))); // Deep clone
            setPresent(nextState);
            lastCommitted.current = nextState;
        }
    }, [present]);

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
