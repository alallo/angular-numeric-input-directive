import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[numeric-input]'
})
export class NumericInputDirective {
    @Input() min: number;
    @Input() max: number;
    @Input() scale: number;

    inputElement: HTMLInputElement;
    previousInputValue: string;

    constructor(public el: ElementRef) {
      this.inputElement = el.nativeElement;
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
      const currentValue = this.inputElement.value;
      this.previousInputValue = currentValue;

      // iOS keyCode Exceptions
      const charStr = e.key;
      if (charStr === '&' ||
          charStr === '*' ||
          charStr === '(' ||
          charStr === ')' ||
          charStr === '$' ||
          charStr === '_' ||
          charStr === '^' ||
          charStr === '>' ||
          charStr === '!') {
        e.preventDefault();
      }

      // Allow some control keys
      if (
        [46, 8, 9, 27, 13, 189, 109].indexOf(e.keyCode) !== -1 || // Allow: Delete, Backspace, Tab, Escape, Enter, Minus
        (e.keyCode === 65 && e.ctrlKey === true) || // Allow: Ctrl+A
        (e.keyCode === 67 && e.ctrlKey === true) || // Allow: Ctrl+C
        (e.keyCode === 86 && e.ctrlKey === true) || // Allow: Ctrl+V
        (e.keyCode === 88 && e.ctrlKey === true) || // Allow: Ctrl+X
        (e.keyCode === 65 && e.metaKey === true) || // Allow: Cmd+A (Mac)
        (e.keyCode === 67 && e.metaKey === true) || // Allow: Cmd+C (Mac)
        (e.keyCode === 86 && e.metaKey === true) || // Allow: Cmd+V (Mac)
        (e.keyCode === 88 && e.metaKey === true) || // Allow: Cmd+X (Mac)
        (e.keyCode >= 35 && e.keyCode <= 39) // Allow: Home, End, Left, Right
      ) {
        return;
      }

      // stop multiple decimal points
      if (e.keyCode === 190 || e.keyCode === 110) {
            if (currentValue.includes('.')) {
                e.preventDefault();
            } else {
                return;
            }
      }

      // Make sure we allow only numbers and a decimal points
      if (
        (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
        (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110
      ) {
        e.preventDefault();
      }
    }

    @HostListener('keyup', ['$event'])
    onKeyUp(e: KeyboardEvent) {
      const currentValue = parseFloat(this.inputElement.value);
      if (currentValue < this.min ||  currentValue > this.max) {
            this.inputElement.value = this.previousInputValue;
            e.preventDefault();

      }
    }

    @HostListener('blur', ['$event'])
    onBlur(e: KeyboardEvent) {
        const convertedValue = this.convertToTwoDP(this.inputElement.value);
        this.inputElement.value = convertedValue.toString();
    }

    private convertToTwoDP(value: string): string {
        return Number(value).toFixed(this.scale);
    }

    @HostListener('paste', ['$event'])
    onPaste(event: ClipboardEvent) {
        event.preventDefault();
        const pastedInput: string = event.clipboardData.getData('text/plain');
        let val = pastedInput.replace(/(?!^[\-\d\.])[^\d\.]/g, '');

        // remove extra dots
        const firstDot = val.indexOf('.');
        if (firstDot > -1) {
            val = val.substr(0, firstDot + 1) + val.substring(firstDot + 1).replace(/\./g, '');
        }
        const cleanedPastedInput = parseFloat(val).toFixed(this.scale);
        document.execCommand('insertText', false, cleanedPastedInput);
    }
}
