export function moveArrayElement<T>(array: T[], oldIndex: number, newIndex: number): void {
    const [element] = array.splice(oldIndex, 1);
    array.splice(newIndex, 0, element);
}

export function insertInArray<T>(array: T[], index: number, value: T): void {
    array.splice(index, 0, value);
}
