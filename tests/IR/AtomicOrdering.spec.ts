import llvm from '../..';

describe('AtomicOrdering', () => {
    test('exports all expected ordering values', () => {
        const ao = llvm.AtomicOrdering;
        expect(typeof ao.NotAtomic).toBe('number');
        expect(typeof ao.Unordered).toBe('number');
        expect(typeof ao.Monotonic).toBe('number');
        expect(typeof ao.Acquire).toBe('number');
        expect(typeof ao.Release).toBe('number');
        expect(typeof ao.AcquireRelease).toBe('number');
        expect(typeof ao.SequentiallyConsistent).toBe('number');
    });

    test('ordering values are distinct', () => {
        const { NotAtomic, Unordered, Monotonic, Acquire, Release, AcquireRelease, SequentiallyConsistent } = llvm.AtomicOrdering;
        const values = [NotAtomic, Unordered, Monotonic, Acquire, Release, AcquireRelease, SequentiallyConsistent];
        const unique = new Set(values);
        expect(unique.size).toBe(values.length);
    });

    test('SequentiallyConsistent is stronger than Monotonic', () => {
        expect(llvm.AtomicOrdering.SequentiallyConsistent).toBeGreaterThan(llvm.AtomicOrdering.Monotonic);
    });
});
