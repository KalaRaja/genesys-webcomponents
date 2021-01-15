import { Component, Element, h, JSX, Listen, State } from '@stencil/core';
import {
  requestInterval,
  clearRequestInterval,
  RequestIntervalHandle
} from '@essentials/request-interval';

import { onDisabledChange } from '../../../../../../utils/dom/on-attribute-change';

/**
 * @slot input - Required slot for input[type="range"]
 * @slot label - Required slot for label
 */
@Component({
  styleUrl: 'gux-input-range-beta.less',
  tag: 'gux-input-range-beta'
})
export class GuxInputRangeBeta {
  private input: HTMLInputElement;
  private progressElement: HTMLDivElement;
  private disabledObserver: MutationObserver;

  @Element()
  private root: HTMLElement;

  @State()
  private disabled: boolean;

  @State()
  private value: string;

  @State()
  private active: boolean;

  @State()
  private valueWatcher: RequestIntervalHandle;

  @Listen('input')
  onInput(e: MouseEvent): void {
    const input = e.target as HTMLInputElement;

    this.updateValue(input.value);
  }

  @Listen('focusin')
  @Listen('mousedown')
  onMousedown(): void {
    if (!this.disabled) {
      this.active = true;
    }
  }

  @Listen('focusout')
  @Listen('mouseup')
  onMouseup(): void {
    this.active = false;
  }

  updateValue(newValue: string): void {
    this.value = newValue;
    this.updatePosition();
  }

  updatePosition() {
    const value = Number(this.input.value || 0);
    const min = Number(this.input.min || 0);
    const max = Number(this.input.max || 100);
    const placementPercentage = ((value - min) / (max - min)) * 100;

    this.progressElement.style.width = `${placementPercentage}%`;
  }

  componentWillLoad() {
    this.input = this.root.querySelector('input[slot="input"]');
    this.disabled = this.input.disabled;
    this.value = this.input.value;

    this.disabledObserver = onDisabledChange(
      this.input,
      (disabled: boolean) => {
        this.disabled = disabled;
      }
    );
  }

  componentDidLoad() {
    this.updatePosition();

    this.valueWatcher = requestInterval(() => {
      if (this.value !== this.input.value) {
        this.updateValue(this.input.value);
      }
    }, 100);
  }

  componentDidUnload(): void {
    this.disabledObserver.disconnect();
    clearRequestInterval(this.valueWatcher);
  }

  render(): JSX.Element {
    return (
      <div
        class={{
          'gux-container': true,
          'gux-disabled': this.disabled
        }}
      >
        <div
          class={{
            'gux-range': true,
            'gux-active': this.active
          }}
        >
          <div class="gux-track">
            <div
              class="gux-progress"
              ref={el => (this.progressElement = el)}
            ></div>
          </div>
          <slot name="input" />
        </div>
        <div
          class={{
            'gux-display': true,
            'gux-active': this.active
          }}
        >
          {this.value}
        </div>
      </div>
    );
  }
}
