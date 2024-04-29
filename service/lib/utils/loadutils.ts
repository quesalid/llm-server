export const loadModule = async function (modulePath: any) {
    try {
        const module = await import(modulePath);
        return (module)
    } catch (error) {
        throw (error)
    }
}