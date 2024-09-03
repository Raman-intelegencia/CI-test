import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appEmailTooltip]'
})
export class EmailTooltipDirective {
  private tooltipElement!: HTMLElement|null;

  @Input() appEmailTooltip: string = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('focus') onMouseEnter() {
    this.showTooltip(this.appEmailTooltip || 'Invalid email');
  }

  @HostListener('blur') onMouseLeave() {
    this.hideTooltip();
  }

  private showTooltip(message: string) {
    this.tooltipElement = this.renderer.createElement('div');
    const text = this.renderer.createText(message);
    this.renderer.appendChild(this.tooltipElement, text);
    this.renderer.addClass(this.tooltipElement, 'tooltip');
    this.renderer.appendChild(document.body, this.tooltipElement);
if(this.tooltipElement){
  const inputPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipElement.getBoundingClientRect();
    const top = inputPos.top - tooltipPos.height - 10;
    const left = inputPos.left + inputPos.width / 2 - tooltipPos.width / 2;
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
}
    
  }

  private hideTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}
