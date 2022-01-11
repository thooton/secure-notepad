export function alert(msg: string, onOk?: Function): void;
export function confirm(msg: string, onOk?: Function, onCancel?: Function): void;
export function prompt(msg: string, onOk?: Function, onCancel?: Function): void;
export function toasts(msg: string, callback: Function): void;