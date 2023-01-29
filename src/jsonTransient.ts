export function jsonTransient<KEY extends string>(obj: { [key in KEY]: any}, propertyName: KEY) {
	let descriptor = Object.getOwnPropertyDescriptor(obj, propertyName) || {};
	descriptor.enumerable = false;
	descriptor.writable = false;
	Object.defineProperty(obj, propertyName, descriptor)
}
